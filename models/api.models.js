const fs = require("fs/promises");

exports.readAPI = () => {
  return fs
    .readFile("./endpoints.json")
    .then((file) => {
      return JSON.parse(file);
    })
    .then((result) => {
      return result;
    });
};
