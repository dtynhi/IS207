const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

const productsHelper = require("../../helpers/products");

// [GET] /
module.exports.index = async (req, res) => {
  // Lấy ra sản phẩm nổi bật
  const productsFeatured = await Product.find({
    featured: "1",
    deleted: false,
    status: "active"
  }).limit(4);

  const newProductsFeatured = productsHelper.priceNewProducts(productsFeatured);
  // Hết Lấy ra sản phẩm nổi bật

  // Hiển thị danh sách sản phẩm mới nhất
  const productsNew = await Product.find({
    deleted: false,
    status: "active"
  }).sort({ position: "desc" }).limit(10);

  const newProductsNew = productsHelper.priceNewProducts(productsNew);
  // Hết Hiển thị danh sách sản phẩm mới nhất

  // Hiển thị danh sách sản phẩm mới nhất
  const productsCategory = await Product.find({
    deleted: false,
    status: "active"
  }).sort({ position: "desc" });

  const newProductsCategory = productsHelper.priceNewProducts(productsCategory);
  // Hết Hiển thị danh sách sản phẩm mới nhất

  res.render("client/pages/home/index", {
    pageTitle: "Trang chủ",
    productsFeatured: newProductsFeatured,
    productsNew: newProductsNew,
    productsCategory: newProductsCategory,
    currentURL: req.url,
  });
};