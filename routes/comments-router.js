const express = require("express");
const {
  deleteCommentByCommentId,
  patchCommentByCommentId,
} = require("../controllers/comments.controllers");
const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", deleteCommentByCommentId);

commentsRouter.patch("/:comment_id", patchCommentByCommentId);

module.exports = commentsRouter;
