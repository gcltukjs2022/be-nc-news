const db = require("../db/connection");

exports.readArticleById = (article_id) => {
  return db
    .query(
      `
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count FROM articles
  JOIN comments ON comments.article_id = articles.article_id
  WHERE articles.article_id=$1
  GROUP BY articles.article_id
  
  `,
      [article_id]
    )
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

exports.readArticles = (
  topic,
  sort_by = "created_at",
  order = "DESC",
  limit = 10,
  p
) => {
  if (isNaN(limit)) {
    return Promise.reject({ status: 400, msg: "limit query must be a number" });
  } else if (limit.length === 0) {
    return Promise.reject({ status: 400, msg: "Invalid limit query" });
  }

  if (topic === undefined && sort_by === "created_at") {
    return db
      .query(
        `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count 
      FROM articles 
      LEFT JOIN comments ON comments.article_id = articles.article_id 
      GROUP BY articles.article_id 
      ORDER BY created_at DESC
      LIMIT ${limit};`
      )
      .then(({ rows }) => {
        return rows;
      });
  }

  const validColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
  ];

  if (validColumns.includes(sort_by) === false) {
    return Promise.reject({ status: 400, msg: "Invalid column" });
  }

  if (order !== "asc" && order !== "DESC") {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  let queryStr = `
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  `;
  const queryValues = [];

  if (typeof topic === "string" && topic.length === 0) {
    return Promise.reject({ status: 400, msg: "Invalid topic" });
  }

  if (topic) {
    queryStr += `WHERE topic = $1`;
    queryValues.push(topic);
  }

  queryStr += `
  GROUP BY articles.article_id
  `;

  if (sort_by) {
    queryStr += `ORDER BY ${sort_by} `;
  } else {
    queryStr += `ORDER BY created_at `;
  }

  order === "asc" ? (queryStr += "ASC") : (queryStr += `${order}`);

  // if (limit !== 10) {
  //   queryStr += ` LIMIT ${limit};`;
  // } else {
  //   queryStr += ` LIMIT 10;`;
  // }

  queryStr += ` LIMIT ${limit}`;

  return db
    .query(queryStr, queryValues)
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.all([
          rows,
          db.query(`SELECT * FROM topics WHERE slug=$1;`, [topic]),
        ]);
      }
      return Promise.all([rows]);
    })
    .then(([rows, topicsResult]) => {
      if (topicsResult !== undefined) {
        if (topicsResult.rowCount > 0) {
          return Promise.reject({
            status: 200,
            msg: "No article with this topic",
          });
        }
        return Promise.reject({ status: 404, msg: "Topic does not exist" });
      }
      return rows;
    });
};

exports.readCommentsByArticleId = (article_id) => {
  return db
    .query(
      `SELECT comment_id, body, author, votes, created_at FROM comments WHERE article_id=$1;`,
      [article_id]
    )
    .then(({ rows, rowCount }) => {
      if (rowCount === 0) {
        return Promise.all([
          rows,
          db.query(`SELECT * FROM articles WHERE article_id=$1;`, [article_id]),
        ]);
      }
      return Promise.all([rows]);
    })
    .then(([rows, articlesResult]) => {
      if (articlesResult !== undefined) {
        if (articlesResult.rowCount > 0) {
          return Promise.reject({
            status: 200,
            msg: "No comments with this article_id",
          });
        }
        return Promise.reject({
          status: 404,
          msg: "article_id does not exist",
        });
      }
      return rows;
    });
};

exports.addCommentByArticleId = (article_id, reqBody) => {
  const { body, username } = reqBody;

  if (body === undefined) {
    return Promise.reject({ status: 400, msg: "Incomplete comment" });
  }

  if (typeof body !== "string") {
    return Promise.reject({ status: 400, msg: "Wrong data type" });
  }

  return db
    .query(`SELECT * FROM articles WHERE article_id=$1;`, [article_id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "article_id does not exist",
        });
      }
      return Promise.all([
        db.query("SELECT * FROM users WHERE username=$1", [username]),
      ]);
    })
    .then(([{ rowCount }]) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 400,
          msg: "username does not exist",
        });
      }
      return db.query(
        `
         INSERT INTO comments
         (article_id, body, author)
         VALUES
         ($1, $2, $3)
         RETURNING *;
         `,
        [article_id, body, username]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.addArticles = (reqBody) => {
  const { author, title, body, topic } = reqBody;
  if (!author || !title || !body || !topic) {
    return Promise.reject({ status: 400, msg: "imcomplete article" });
  }

  if (
    typeof author !== "string" ||
    typeof title !== "string" ||
    typeof body !== "string" ||
    typeof topic !== "string"
  ) {
    return Promise.reject({ status: 400, msg: "wrong data type" });
  }

  return db
    .query(`SELECT * FROM users WHERE username=$1`, [author])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({ status: 400, msg: "username does not exist" });
      }
      return db
        .query(`SELECT * FROM topics WHERE slug=$1`, [topic])
        .then(({ rowCount }) => {
          if (rowCount === 0) {
            return Promise.reject({ status: 400, msg: "topic does not exist" });
          }
          return db
            .query(
              `
          INSERT INTO articles
          (author, title, body, topic)
          VALUES
          ((SELECT username FROM users WHERE users.username=$1), $2, $3, (SELECT slug FROM topics WHERE topics.slug=$4))
          RETURNING *     
        `,
              [author, title, body, topic]
            )
            .then(() => {
              return db.query(
                `
      SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, CAST(COUNT(comments.article_id) AS INT) AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY created_at DESC
      LIMIT 1;
      `
              );
            })
            .then(({ rows }) => {
              return rows[0];
            });
        });
    });
};
