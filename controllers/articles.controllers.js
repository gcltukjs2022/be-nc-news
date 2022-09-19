const {
  readArticleById,
  updateArticleById,
  readArticles,
  readCommentsByArticleId,
  addCommentByArticleId,
  addArticles,
  removeArticleByArticleId,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  readArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleById(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;
  readArticles(topic, sort_by, order, limit, p)
    .then((articles) => {
      res
        .status(200)
        .send({ articles: articles.rows, total_count: articles.total_count });
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;
  readCommentsByArticleId(article_id, limit, p)
    .then((comments) => {
      res
        .status(200)
        .send({ comments: comments.rows, total_count: comments.total_count });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const reqBody = req.body;
  addCommentByArticleId(article_id, reqBody)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.postArticles = (req, res, next) => {
  const reqBody = req.body;
  addArticles(reqBody)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  removeArticleByArticleId(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
