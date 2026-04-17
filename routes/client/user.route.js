const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();
const controller = require("../../controllers/client/user.controller");
const validate = require("../../validates/client/user.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

router.get("/address", controller.address);

router.get("/changepassword", controller.changePass);

router.get("/address/create", controller.createAdd);

router.patch("/:id/address/create", controller.newAdd);

router.patch("/:id/changepass", controller.updatePassword);

router.patch("/:id/:idAdd/address/update", controller.update_address);

router.patch(
  "/:id/update",
  upload.single("avatar"),
  uploadCloud.upload,
  controller.update
);

router.get("/register", controller.register);

router.post("/register", validate.registerPost, controller.registerPost);

router.get("/login", controller.login);

router.post("/login", validate.loginPost, controller.loginPost);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.forgotPassword);

router.post(
  "/password/forgot",
  validate.forgotPasswordPost,
  controller.forgotPasswordPost
);

router.get("/password/otp", controller.otpPassword);

router.post("/password/otp", controller.otpPasswordPost);

router.get("/password/reset", controller.resetPassword);

router.get("/purchase", controller.purchase);

router.post(
  "/password/reset",
  validate.resetPasswordPost,
  controller.resetPasswordPost
);

router.get("/info", authMiddleware.requireAuth, controller.info);

module.exports = router;
