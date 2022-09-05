const { readTopics } = require("../models/news.models");

exports.getTopics = (req, res, next) => {
  readTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};
