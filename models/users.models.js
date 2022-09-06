const db = require("../db/connection");

exports.readUsers = () => {
  return db.query("SELECT * FROM users").then((result) => {
    return result.rows;
  });
};
