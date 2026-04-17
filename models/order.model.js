const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: String,
    cart_id: String,
    userInfo: {
      fullName: String,
      phone: String,
      address: String,
    },
    products: [
      {
        thumbnail: String,
        product_id: String,
        title: String,
        price: Number,
        discountPercentage: Number,
        priceNew: Number,
        totalPrice: Number,
        quantity: Number,
        slug: String,
      }
    ],
    totalPrice: Number,
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

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
