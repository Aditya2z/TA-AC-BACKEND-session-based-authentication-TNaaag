var express = require("express");
var router = express.Router();
var Product = require("../models/product");
var Cart = require("../models/cart");

/* GET products listing. */
router.get("/", function (req, res, next) {
  var error = req.flash("error")[0];
  var success = req.flash("success")[0];
  Product.find({})
    .then((productList) => {
      res.render("products", {
        products: productList,
        error: error,
        success: success,
      });
    })
    .catch((err) => {
      next(err);
    });
});

//to show cart
router.get("/cart", function (req, res, next) {
  var error = req.flash("error")[0];
  var success = req.flash("success")[0];
  const userId = req.session.userId;
  Cart.findOne({ user: userId })
    .populate("items.product")
    .then((cart) => {
      res.render("cart", { cart: cart, error: error, success: success });
    });
});

// Add product to cart
router.get("/:id/cart/add", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const quantity = 1;
    const product = await Product.findById(productId);

    // Check if the user already has a cart, if not create one
    const userId = req.session.userId;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the product is already in the cart, if yes, update the quantity
    const existingCartItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    req.flash("success", "Product added to cart successfully");
    res.redirect("/products");
  } catch (error) {
    next(error);
  }
});

// Get Single Product Details
router.get("/:id", function (req, res, next) {
  Product.findById(req.params.id)
    .then((product) => {
      res.render("productDetails", { product: product });
    })
    .catch((err) => {
      next(err);
    });
});

// Handle Likes
router.get("/:id/like", function (req, res, next) {
  Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  )
    .then((updatedProduct) => {
      res.render("productDetails", { product: updatedProduct });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
