const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  phonenumber: {
    type: String,
    required: [true, "user must have a phone number"],
    unique: true,
  },
  verificationCode: String,
  codeExpiresAt: Date,
  isOtpVerified: {
    type: Boolean,
  },
  isAuthenticated: Boolean,
});

const user = mongoose.model("User", userSchema);
module.exports = user;
