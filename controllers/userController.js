const twilio = require("twilio");
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const User = require("../models/userModel");
const {
  twilioSendVerificationCodeHandler,
  verifyPhoneNumberHandler,
} = require("../auth/verificationCode");
const { generateToken } = require("../auth/token");
const AppError = require("../util/appError");

const sendRequestForOtpHandler = async (req, res, next) => {
  try {
    const { phonenumber } = req.params;
    const trimmedPhoneNumber = phonenumber.replace(/\D/g, "");
    const verifiedCallerId = await verifyPhoneNumberHandler({
      client,
      trimmedPhoneNumber,
    });
    if (trimmedPhoneNumber.length !== 10) {
      return next(
        new AppError(`Invalid phone number Or phone number must be at least 10 characters`, 404)
      );
    }
    if (!verifiedCallerId) {
      return next(new AppError(`Number is not registred in Twilio server`, 404));
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 2 * 60000);
    let user = await User.findOne({ phonenumber: trimmedPhoneNumber });

    if (!user) {
      user = await User.create({
        phonenumber: phonenumber,
        verificationCode,
        codeExpiresAt,
        isOtpVerified: false,
        isAuthenticated: false,
      });
    } else {
      user.verificationCode = verificationCode;
      user.codeExpiresAt = codeExpiresAt;
      await user.save();
    }
    await twilioSendVerificationCodeHandler({
      client,
      verificationCode,
      phonenumber: `+91${phonenumber}`,
    });
    const token = generateToken(user);
    res.status(200).json({
      status: "success",
      message: `Message Sent successfully to :${phonenumber}`,
      phonenumber: phonenumber,
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

const verifyCodeHandler = async (req, res, next) => {
  try {
    const { phonenumber, verificationCode } = req.params;
    const trimmedPhoneNumber = phonenumber.replace(/\D/g, "");
    const trimmedVerificationCode = verificationCode.replace(/\D/g, "");
    const user = await User.findOne({ phonenumber: trimmedPhoneNumber });
    console.log(user, "the user");
    if (
      !user ||
      user.verificationCode !== trimmedVerificationCode ||
      new Date() > user.codeExpiresAt
    ) {
      return next(new AppError(`Invalid User or expired verification code`, 400));
    }
    user.isOtpVerified = true;
    user.verificationCode = null;
    user.codeExpiresAt = null;
    user.isAuthenticated = true;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "Code verified successfully",
    });
  } catch (error) {
    next(error);
  }
};
const protectedRouter = (req, res, next) => {
  try {
    res.status(200).json({
      status: "success",
      message: "Access granted..!",
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const { phonenumber } = req.params;
    const trimmedPhoneNumber = phonenumber.replace(/\D/g, "");
    const user = await User.findOne({ phonenumber: trimmedPhoneNumber });
    if (!user) {
      return next(new AppError(`Invalid User or expired Token`, 400));
    }
    user.isAuthenticated = false;
    await user.save();
    res.status(200).json({
      status: "success",
      message: "Logout success..!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendRequestForOtpHandler,
  verifyCodeHandler,
  protectedRouter,
  logoutUser,
};
