const db = require("../db/connection");

exports.readUsers = () => {
  return db.query("SELECT * FROM users").then((result) => {
    return result.rows;
  });
};

exports.readUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username=$1", [username])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "User does not exist" });
      }
      return result.rows[0];
    });
};
