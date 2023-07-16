var express = require("express");
var router = express.Router();
var Article = require("../models/article");
var Comment = require("../models/comment");

// Get new Article form
router.get("/new", function (req, res, next) {
  res.render("newArticleForm");
});

/* Create article. */
router.post("/", function (req, res, next) {
  req.body.tags = req.body.tags.trim().split(" ");
  Article.create(req.body)
    .then(() => {
      res.redirect("/articles");
    })
    .catch((err) => {
      next(err);
    });
});

/* GET articles listing. */
router.get("/", function (req, res, next) {
  Article.find({})
    .then((articleList) => {
      res.render("articleList", { articles: articleList });
    })
    .catch((err) => {
      next(err);
    });
});

// Get Single Article Details and Comments
router.get("/:id", function (req, res, next) {
  Article.findById(req.params.id)
    .populate("comments")
    .then((article) => {
      res.render("articleDetails", { article: article });
    })
    .catch((err) => {
      next(err);
    });
});

// Update Article Details form
router.get("/:id/update", function (req, res, next) {
  Article.findById(req.params.id)
    .then((article) => {
      article.tags = article.tags.join(" ");
      res.render("updateArticleForm", { article: article });
    })
    .catch((err) => {
      next(err);
    });
});

//Update Article
router.post("/:id", function (req, res, next) {
  req.body.tags = req.body.tags.trim().split(" ");
  Article.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((updatedArticle) => {
      res.render("articleDetails", { article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
});

//Delete Article
router.get("/:id/delete", function (req, res, next) {
  Article.findByIdAndDelete(req.params.id)
    .then((deletedArticle) => {
      Comment.deleteMany({ articleId: deletedArticle._id })
        .then(() => {
          res.redirect("/articles");
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

// Handle Likes
router.get("/:id/likes", function (req, res, next) {
  Article.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  )
    .then((updatedArticle) => {
      res.render("articleDetails", { article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
});

// Create Comments
router.post("/:id/comments", async function (req, res, next) {
  const id = req.params.id;
  req.body.articleId = id;

  await Comment.create(req.body)
    .then((newComment) => {
      Article.findByIdAndUpdate(
        id,
        {
          $push: { comments: newComment._id },
        },
        { new: true }
      ).then(() => {
        res.redirect("/articles/" + id);
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
