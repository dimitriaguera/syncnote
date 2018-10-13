const mongodb = require("../db/mongodb");
const { hashPassword } = require("./service");

module.exports = {
  init,
  userFactory
};

function init() {
  mongodb.getDb().createCollection(
    "user",
    {
      capped: true,
      size: 100000,
      max: 5000
    },
    function(err, results) {
      console.log("Collection user created.");
    }
  );
}

async function userFactory(data) {
  const { username, password, cfPassword, roles, id } = data;

  if (!username || !password || !cfPassword) {
    const err = new Error(
      "You must give a Username, password and confirmation password."
    );
    err.statusCode = 400;
    throw err;
  }

  if (password !== cfPassword) {
    const err = new Error(
      "Your password and confirmation password do not match."
    );
    err.statusCode = 400;
    throw err;
  }

  const hashed = await hashPassword(password);
  const _user = { username: username, password: hashed, roles: roles };
  if (id) _user._id = id;

  return _user;
}
