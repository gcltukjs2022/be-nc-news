const { readAPI } = require("../models/api.models");

exports.getAPI = (req, res, next) => {
  readAPI()
    .then((api) => {
      res.status(200).send(api);
    })
    .catch(next);
};
