const mongoose = require("mongoose");
const generate = require("../helpers/generate");
const {ObjectId} = require("mongodb");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    avatar: String,
    birthday: {
      type: Date,
      default: new Date().getDate()
    },
    address:[
        {
        mainAddress: String,
        isDefault:Boolean,
        idAddress: {
        type:ObjectId,
        ref:"address",
        },
        }
    ],
    tokenUser: {
      type: String,
      default: generate.generateRandomString(20)
    },
    phone: String,
    status: {
      type: String,
      default: "active"
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;