const express = require("express");
const {
  deleteCommentByCommentId,
} = require("../controllers/articles.controllers");
const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", deleteCommentByCommentId);

module.exports = commentsRouter;
