const express = require("express");
const { getAPI } = require("../controllers/api.controllers");
const apiRouter = express.Router();
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const topicsRouter = require("./topics-router");
const usersRouter = require("./users-router");

apiRouter.get("/", getAPI);

apiRouter.use("/articles", articlesRouter);

apiRouter.use("/topics", topicsRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
