const MongoClient = require("mongodb").MongoClient;
const config = require("../../config.server");
const { promisify } = require("util");

let _db;

async function initDatabase() {
  const url = `mongodb://${config.db.host}:${config.db.port}`;

  let opt = {};

  if (config.db.user && config.db.password) {
    opt.user = config.db.user;
    opt.pass = config.db.password;
  }

  // Use connect method to connect to the Server
  const mongoConnect = promisify(MongoClient.connect);
  const client = await mongoConnect(url, { useNewUrlParser: true });
  _db = client.db(config.db.database);
  console.log("Connected to database server.");

  return _db;
}

module.exports = {
  connect: initDatabase,
  getDb: () => _db,
  closeDb: () => _db.close()
};
