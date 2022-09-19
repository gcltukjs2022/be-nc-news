const db = require("../db/connection");

exports.readTopics = () => {
  return db.query("SELECT * FROM topics").then((result) => {
    return result.rows;
  });
};

exports.addTopic = (slug, description) => {
  if (!slug) {
    return Promise.reject({ status: 400, msg: "Incomplete topic" });
  }

  if (description) {
    if (typeof slug !== "string") {
      return Promise.reject({ status: 400, msg: "Wrong Data type" });
    }
    return db
      .query(
        `
  INSERT INTO topics
  (slug, description)
  VALUES
  ($1, $2)
  RETURNING *
  `,
        [slug, description]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  } else {
    if (typeof slug !== "string") {
      return Promise.reject({ status: 400, msg: "Wrong Data type" });
    }
    return db
      .query(
        `
  INSERT INTO topics
  (slug)
  VALUES
  ($1)
  RETURNING *
  `,
        [slug]
      )
      .then(({ rows }) => {
        return rows[0];
      });
  }
};
