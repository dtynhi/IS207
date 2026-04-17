const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");

const productsHelper = require("../../helpers/products");

const productUpdateHelper = require("../../helpers/products");

// [GET] /checkout/
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;

  const cart = await Cart.findOne({
    _id: cartId,
  });

  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productId = item.product_id;
      const productInfo = await Product.findOne({
        _id: productId,
      }).select("title thumbnail slug price discountPercentage");

      productInfo.priceNew = productsHelper.priceNewProduct(productInfo);

      item.productInfo = productInfo;

      item.totalPrice = productInfo.priceNew * item.quantity;
    }
  }

  cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

  res.render("client/pages/checkout/index", {
    pageTitle: "Đặt hàng",
    cartDetail: cart,
  });
};

// [POST] /checkout/order
module.exports.order = async (req, res) => {
  const cartId = req.cookies.cartId;
  const userInfo = req.body;

  const cart = await Cart.findOne({
    _id: cartId
  });

  const products = [];

  for(const product of cart.products) {
    const objectProduct = {
      product_id: product.product_id,
      title: product.title,
      price: 0,
      discountPercentage: 0,
      priceNew: 0,
      quantity: product.quantity,
      totalPrice: 0,
      stock: 0,
      thumbnail: '',
      slug: "",
    };

    const productInfo = await Product.findOne({
      _id: product.product_id
    }).select("price discountPercentage title stock thumbnail slug");

    objectProduct.price = productInfo.price;
    objectProduct.discountPercentage = productInfo.discountPercentage;
    objectProduct.priceNew = productInfo.price * (1 - productInfo.discountPercentage / 100);
    objectProduct.totalPrice = objectProduct.quantity * objectProduct.priceNew;
    objectProduct.title = productInfo.title;
    objectProduct.stock = productInfo.stock - objectProduct.quantity;
    objectProduct.thumbnail = productInfo.thumbnail;
    objectProduct.slug = productInfo.slug;

    products.push(objectProduct);

    try {
      
      // Xử lý cập nhật số lượng trong kho
      await productUpdateHelper.updateProductQuantity(objectProduct.product_id, objectProduct.stock);

    } catch (error) {
      res.status(500).send('Đã xảy ra lỗi khi cập nhật số lượng');
    }
  }

  totalPrice = products.reduce((sum, item) => sum + item.totalPrice, 0);

  const orderInfo = {
    cart_id: cartId,
    userInfo: userInfo,
    products: products,
    totalPrice: totalPrice,
  };

  const order = new Order(orderInfo);
  order.save();

  await Cart.updateOne({
    _id: cartId
  }, {
    products: []
  });

  res.redirect(`/checkout/success/${order.id}`);
}

// [GET] /checkout/success/:orderId
module.exports.success = async (req, res) => {
 
  const order = await Order.findOne({
    _id: req.params.orderId
  });

  // Update User ID 
  const user_id = req.cookies.tokenUser;
  await Order.updateOne ( 
    {
      _id: req.params.orderId
    },
    {
      $set: {
        "user_id": user_id
      }
    }
  )

  for (const product of order.products) {
    const productInfo = await Product.findOne({
      _id: product.product_id
    }).select("title thumbnail");

    product.productInfo = productInfo;

    product.priceNew = productsHelper.priceNewProduct(product);

    product.totalPrice = product.priceNew * product.quantity;
  }

  order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);

  res.render("client/pages/checkout/success", {
    pageTitle: "Đặt hàng thành công",
    order: order
  });
}