const Product = require("../models/product.model");

module.exports.priceNewProducts = (products) => {
  const newProducts = products.map((item) => {
    item.priceNew = (
      (item.price * (100 - item.discountPercentage)) /
      100
    ).toFixed(0);
    return item;
  });

  return newProducts;
}

module.exports.priceNewProduct = (product) => {
  const priceNew = (
    (product.price * (100 - product.discountPercentage)) /
    100
  ).toFixed(0);

  return parseInt(priceNew);
}

module.exports.updateProductQuantity = async (productId, newQuantity) => {
  try {
    // Cập nhật số lượng trong kho của sản phẩm với ID tương ứng
    const product = await Product.findByIdAndUpdate(productId, { stock: newQuantity });

    // Kiểm tra xem sản phẩm đã được cập nhật thành công hay không
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm');
    }
  } catch (error) {
    throw new Error('Đã xảy ra lỗi khi cập nhật số lượng');
  }
}