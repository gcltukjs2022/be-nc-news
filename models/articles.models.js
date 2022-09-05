const db = require("../db/connection");

exports.readArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id=$1`, [article_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 400, msg: "No Such Article" });
      } else {
        return result.rows[0];
      }
    });
};
