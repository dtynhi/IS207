const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user_id: String,
    products: [
      {
        product_id: String,
        title: String,
        quantity: Number,
        slug: String,
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("Cart", cartSchema, "carts");

module.exports = Cart;