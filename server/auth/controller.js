const jwt = require("jsonwebtoken");
const config = require("../../config.server");
const mongodb = require("../db/mongodb");
const { userFactory } = require("./model");
const { comparePassword, secureUser, hashPassword } = require("./service");

module.exports = {
  login,
  register,
  getAll
};

async function login(req, res, next) {
  const { username, password } = req.body;

  try {
    const user = await mongodb
      .getDb()
      .collection("user")
      .findOne({ username: username });
    if (!user) {
      throw "Wrong user or password";
    }
    const isValidPwd = await comparePassword(user, password);
    if (!isValidPwd) {
      throw "Wrong user or password";
    }
    const token = jwt.sign(secureUser(user), config.security.jwtSecret, {
      expiresIn: config.session.maxAgeToken
    });
    res.json({
      success: true,
      data: {
        user: user,
        token: `BEARER ${token}`
      }
    });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
}

async function register(req, res) {
  const _user = await userFactory(req.body);
  const _res = await mongodb
    .getDb()
    .collection("user")
    .insertOne(_user);
  res.json({
    success: true,
    data: _res
  });
}

function getAll(req, res) {
  mongodb
    .getDb()
    .collection("user")
    .find()
    .toArray((err, docs) => {
      if (err) {
        return res.json({ success: false, error: "Nothing." });
      }
      res.json(docs);
    });
}
