module.exports = (arr, minPrice, maxPrice) => {
  let products = [];
  if (minPrice && maxPrice) {
    products = arr.filter((items) => {
      return items.price >= minPrice && items.price <= maxPrice
    })
  } else if (minPrice) {
    products = arr.filter((items) => {
      return items.price >= minPrice
    })
  } else if (maxPrice) {
    products = arr.filter((items) => {
      return items.price <= maxPrice;
    })
  } 
  return products;
}