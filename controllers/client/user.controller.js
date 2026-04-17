const md5 = require("md5");

const User = require("../../models/user.model");
const ForgotPassword = require("../../models/forgot-password.route");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const mongoose = require("mongoose");

const generateHelper = require("../../helpers/generate");
const sendMailHelper = require("../../helpers/sendMail");
const paginationHelper = require("../../helpers/pagination");

// [GET] /user/register
module.exports.register = async (req, res) => {
  res.render("client/pages/user/register", {
    pageTitle: "Đăng ký tài khoản",
  });
};

// [POST] /user/register
module.exports.registerPost = async (req, res) => {
  const existEmail = await User.findOne({
    email: req.body.email,
  });

  if (existEmail) {
    req.flash("error", "Email đã tồn tại!");
    res.redirect("back");
    return;
  }

  req.body.password = md5(req.body.password);

  const user = new User(req.body);
  await user.save();

  res.cookie("tokenUser", user.tokenUser);

  res.redirect("/");
};

// [GET] /user/login
module.exports.login = async (req, res) => {
  res.render("client/pages/user/login", {
    pageTitle: "Đăng nhập tài khoản",
  });
};

// [POST] /user/login
module.exports.loginPost = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại!");
    res.redirect("back");
    return;
  }

  if (md5(password) !== user.password) {
    req.flash("error", "Sai mật khẩu!");
    res.redirect("back");
    return;
  }

  if (user.status === "inactive") {
    req.flash("error", "Tài khoản đang bị khóa!");
    res.redirect("back");
    return;
  }

  const cart = await Cart.findOne({
    user_id: user.id,
  });

  if (cart) {
    res.cookie("cartId", cart.id);
  } else {
    await Cart.updateOne(
      {
        _id: req.cookies.cartId,
      },
      {
        user_id: user.id,
      }
    );
  }

  res.cookie("tokenUser", user.tokenUser);

  res.redirect("/");
};

// [GET] /user/logout
module.exports.logout = async (req, res) => {
  res.clearCookie("tokenUser");
  res.clearCookie("cartId");
  res.redirect("/");
};

// [GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
  res.render("client/pages/user/forgot-password", {
    pageTitle: "Lấy lại mật khẩu",
  });
};

// [POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email;

  const user = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!user) {
    req.flash("error", "Email không tồn tại!");
    res.redirect("back");
    return;
  }

  // Lưu thông tin vào DB
  const otp = generateHelper.generateRandomNumber(8);

  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now(),
  };

  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();

  // Nếu tồn tại email thì gửi mã OTP qua email
  const subject = "Mã OTP xác minh lấy lại mật khẩu";
  const html = `
    Mã OTP để lấy lại mật khẩu là <b style="color: green;">${otp}</b>. Thời hạn sử dụng là 3 phút.
  `;
  sendMailHelper.sendMail(email, subject, html);

  res.redirect(`/user/password/otp?email=${email}`);
};

// [GET] /user/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.query.email;

  res.render("client/pages/user/otp-password", {
    pageTitle: "Nhập mã OTP",
    email: email,
  });
};

// [POST] /user/password/otp
module.exports.otpPasswordPost = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    req.flash("error", "OTP không hợp lệ!");
    res.redirect("back");
    return;
  }

  const user = await User.findOne({
    email: email,
  });

  res.cookie("tokenUser", user.tokenUser);

  res.redirect("/user/password/reset");
};

// [GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
  res.render("client/pages/user/reset-password", {
    pageTitle: "Đổi mật khẩu",
  });
};

// [POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
  const password = req.body.password;
  const tokenUser = req.cookies.tokenUser;

  await User.updateOne(
    {
      tokenUser: tokenUser,
    },
    {
      password: md5(password),
    }
  );

  res.redirect("/");
};

// [GET] /user/info
module.exports.info = async (req, res) => {
  res.render("client/pages/user/info", {
    pageTitle: "Thông tin tài khoản",
    User: User,
  });
};
//[GET] /user/address
module.exports.address = async (req, res) => {
  res.render("client/pages/user/info-address", {
    pageTitle: "Thông tin tài khoản",
    User: User,
  });
};

//[GET] /user/address/create
module.exports.createAdd = async (req, res) => {
  res.render("client/pages/user/create-address", {
    pageTitle: "Thông tin tài khoản",
    User: User,
  });
};

//[GET] /user/changepassword
module.exports.changePass = async (req, res) => {
  res.render("client/pages/user/config-changepass", {
    User: User,
  });
};

//[POST] /user/info
module.exports.update = (req, res, next) => {
  const day = req.body.day;
  const month = req.body.month;
  const year = req.body.year;
  const dateOfBirth = new Date(year, month - 1, day);

  const data = {
    ...req.body,
    birthday: dateOfBirth,
  };
  User.updateOne({ _id: req.params.id }, data)
    .then(() => res.redirect("/user/info"))
    .catch(next);
};

//[POST] user/update/address
module.exports.update_address = (req, res, next) => {
  const userId = req.params.id;
  const mainAddressValue = req.body.mainAddress;
  const idAdd = req.params.idAdd;
  User.updateOne(
    {
      _id: userId,
      "address.idAddress": idAdd,
    },
    { $set: { "address.$.mainAddress": mainAddressValue } }
  )
    .then(() => res.redirect("/user/address"))
    .catch(next);
};

//[POST] user/:id/changepass
module.exports.updatePassword = async (req, res, next) => {
  const newpass = req.body.newpassword;
  const confirmpassword = req.body.confirmpassword;
  const user = await User.findOne({ _id: req.params.id });
  const oldHashedPass = md5(req.body.password);
  if (newpass === confirmpassword && oldHashedPass === user.password) {
    const hashedPassword = md5(newpass);
    try {
      await User.updateOne(
        { _id: req.params.id },
        { password: hashedPassword }
      );
      req.flash("success", "Cập nhật mật khẩu thành công");
      res.redirect("/user/changepassword");
    } catch (error) {
      next(error);
    }
  } else {
    req.flash(
      "error",
      "Vui lòng nhập lại mật khẩu mới hoặc kiểm tra lại mật khẩu cũ"
    );
    res.redirect("/user/changepassword");
  }
};

//[POST] user/id/address/create
module.exports.newAdd = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const addressObject = {
      mainAddress: req.body.mainAddress,
      isDefault: false,
      idAddress: new mongoose.Types.ObjectId(), // Tạo một ObjectId mới
    };
    await User.updateOne(
      { _id: userId },
      { $push: { address: addressObject } }
    );

    res.redirect("/user/address");
  } catch (error) {
    next(error);
  }
};

//[GET] user/purchase
module.exports.purchase = async (req, res) => {
  // Pagination
  const countPurchase = await Order.find({
    user_id: req.cookies.tokenUser
  }).count();

  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 4,
    },
    req.query,
    countPurchase,
  );
  // End Pagination

  const purchase = await Order.find({
    user_id: req.cookies.tokenUser
  })
  .limit(objectPagination.limitItems)
  .skip(objectPagination.skip);

  res.render("client/pages/user/purchase", {
    pageTitle: "Đơn mua",
    purchase: purchase,
    pagination: objectPagination,
  })
}