var express = require("express");
var router = express.Router();
var Product = require("../models/product");

// Get new Product form
router.get("/products/new", function (req, res, next) {
  res.render("newProduct");
});

/* Create product. */
router.post("/products", function (req, res, next) {
  req.body.category = req.body.category.trim().split(" ");
  Product.create(req.body)
    .then(() => {
      res.redirect("/products");
    })
    .catch((err) => {
      next(err);
    });
});

// Update Product Details form
router.get("/products/:id/update", function (req, res, next) {
  Product.findById(req.params.id)
    .then((product) => {
      product.category = product.category.join(" ");
      res.render("updateProduct", { product: product });
    })
    .catch((err) => {
      next(err);
    });
});

//Update Product
router.post("/products/:id", function (req, res, next) {
  req.body.category = req.body.category.trim().split(" ");
  Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedProduct) => {
      res.render("productDetails", { product: updatedProduct });
    })
    .catch((err) => {
      next(err);
    });
});

//Delete Product
router.get("/products/:id/delete", function (req, res, next) {
  Product.findByIdAndDelete(req.params.id)
    .then((deletedProduct) => {
      Comment.deleteMany({ articleId: deletedProduct._id })
        .then(() => {
          res.redirect("/products");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
