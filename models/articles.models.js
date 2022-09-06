const db = require("../db/connection");

exports.readArticleById = (article_id) => {
  return db
    .query(
      `
      ALTER TABLE articles
      ADD comment_count INT 
    `
    )
    .then(() => {
      return db.query(`SELECT * FROM comments WHERE article_id=$1`, [
        article_id,
      ]);
    })
    .then((result) => {
      const comment_count = result.rowCount;
      return db.query(
        `
      UPDATE articles
      SET comment_count = ${comment_count}
      WHERE article_id=$1
      RETURNING *
  `,
        [article_id]
      );
    })
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "article_id is not found",
        });
      } else {
        return result.rows[0];
      }
    });
};

exports.updateArticleById = (article_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "inc_vote key is not found" });
  }
  if (typeof inc_votes === "number") {
    return db
      .query(
        `
  UPDATE articles
  SET votes = votes + ${inc_votes}
  WHERE article_id=$1
  RETURNING *
  `,
        [article_id]
      )
      .then((result) => {
        if (result.rowCount === 0) {
          return Promise.reject({
            status: 404,
            msg: "article_id does not exist",
          });
        } else {
          return result.rows[0];
        }
      });
  } else {
    return Promise.reject({ status: 400, msg: "Wrong data type" });
  }
};
