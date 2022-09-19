const db = require("../db/connection");

exports.removeCommentByCommentId = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id=$1 RETURNING *;", [
      comment_id,
    ])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment_id does not exist",
        });
      }
    });
};

exports.updateCommentByCommentId = (comment_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "inc_votes key is not found" });
  }

  if (typeof inc_votes === "number") {
    return db
      .query(
        `  
  UPDATE comments
  SET votes = votes + ${inc_votes}
  WHERE article_id=$1
  RETURNING *;`,
        [comment_id]
      )
      .then((result) => {
        if (result.rowCount === 0) {
          return Promise.reject({
            status: 404,
            msg: "comment_id does not exist",
          });
        }
        return result.rows[0];
      });
  }
  return Promise.reject({ status: 400, msg: "Wrong data type" });
};
