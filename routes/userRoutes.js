const express = require("express");
const router = express.Router();
const {
  sendRequestForOtpHandler,
  verifyCodeHandler,
  protectedRouter,
  logoutUser,
} = require("../controllers/userController");
const { athenticateHandler } = require("../auth/token");

router.route("/logout/:phonenumber").post(athenticateHandler, logoutUser);
router.route("/:phonenumber").post(sendRequestForOtpHandler);
router.route("/:phonenumber/:verificationCode").post(athenticateHandler, verifyCodeHandler);
router.route("/protected/:phonenumber?").get(athenticateHandler, protectedRouter);

module.exports = router;
