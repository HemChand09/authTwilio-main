const twilioSendVerificationCodeHandler = async ({ client, verificationCode, phonenumber }) => {
  const response = await client.messages.create({
    body: `Dear Customer Your Verification Code is :${verificationCode}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phonenumber,
  });
  return response;
};

const verifyPhoneNumberHandler = async ({ client, trimmedPhoneNumber }) => {
  const verifiedNumbers = await client.outgoingCallerIds.list();
  const incomingPhoneNumberFiler = verifiedNumbers.filter(
    (number) => number.phoneNumber === `+91${trimmedPhoneNumber}`
  );
  return incomingPhoneNumberFiler[0];
};

module.exports = {
  twilioSendVerificationCodeHandler,
  verifyPhoneNumberHandler,
};
