const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");

const paginationHelper = require("../../helpers/pagination");
const productsHelper = require("../../helpers/products");
const productsCategoryHelper = require("../../helpers/products-category");
const filterPriceHelper = require("../../helpers/filterPrice");


// [GET] /products
module.exports.index = async (req, res) => {
  let match = {};
  let newProducts = [];

  if (req.query.school) {
    match.school = new RegExp(req.query.school, "i");
  }

  if (req.query.facet) {
    match.product_category_id = req.query.facet;
  }
  match.deleted = false;
  match.status = "active";

  const products = await Product.find(match).sort({ position: "desc" });

  if (req.query.minPrice || req.query.maxPrice) {
    let filterPrice = filterPriceHelper(products, req.query.minPrice, req.query.maxPrice);
    newProducts = productsHelper.priceNewProducts(filterPrice)
  } else newProducts = productsHelper.priceNewProducts(products);

  // Pagination 
  const countProducts = newProducts.length;
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 25,
    },
    req.query,
    countProducts
  );

  newProducts = newProducts.slice(objectPagination.skip, objectPagination.skip + objectPagination.limitItems);
  // End Pagination 

  res.render("client/pages/products/index", {
    pageTitle: "Danh sách sản phẩm",
    products: newProducts,
    pagination: objectPagination, 
  });
};

// [GET] /products/:slugProduct
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      slug: req.params.slugProduct,
      status: "active"
    };

    const product = await Product.findOne(find);

    if(product.product_category_id) {
      const category = await ProductCategory.findOne({
        _id: product.product_category_id,
        status: "active",
        deleted: false
      });

      product.category = category;
    }

    product.priceNew = productsHelper.priceNewProduct(product);

    res.render("client/pages/products/detail", {
      pageTitle: product.title,
      product: product
    });
  } catch (error) {
    res.redirect(`/products`);
  }
};

// [GET] /products/:slugCategory
module.exports.category = async (req, res) => {
  const category = await ProductCategory.findOne({
    slug: req.params.slugCategory,
    status: "active",
    deleted: false
  });

  const listSubCategory = await productsCategoryHelper.getSubCategory(category.id);

  const listSubCategoryId = listSubCategory.map(item => item.id);

  // Filter
  let match = {};
  let newProducts = [];

  if (req.query.school) {
    match.school = new RegExp(req.query.school, "i");
  }

  if (req.query.facet) {
    match.product_category_id = req.query.facet;
  }
  match.deleted = false;
  match.status = "active";
  match.product_category_id = { $in: [category.id, ...listSubCategoryId] }
  // End Filter 

  const products = await Product.find(match).sort({ position: "desc" });

  if (req.query.minPrice || req.query.maxPrice) {
    let filterPrice = filterPriceHelper(products, req.query.minPrice, req.query.maxPrice);
    newProducts = productsHelper.priceNewProducts(filterPrice)
  } else newProducts = productsHelper.priceNewProducts(products);

  // Pagination 
  const countProducts = newProducts.length;
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limitItems: 25,
    },
    req.query,
    countProducts
  );

  newProducts = newProducts.slice(objectPagination.skip, objectPagination.skip + objectPagination.limitItems);
  // End Pagination 

  res.render("client/pages/products/index", {
    pageTitle: category.title,
    products: newProducts,
    pagination: objectPagination, 
  });
};
