const express = require("express");
const articlesRouter = express.Router();
const {
  getArticleById,
  getArticles,
  patchArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("../controllers/articles.controllers");

articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", patchArticleById);
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postCommentByArticleId);
articlesRouter.get("/", getArticles);

module.exports = articlesRouter;
