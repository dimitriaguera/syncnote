const mongodb = require('../db/mongodb');

ok = '2345';
ok2 = 23;

module.exports = {
  _nodeStream: (pipe = []) => {
    return mongodb
      .getDb()
      .collection('node')
      .watch(pipe);
  }
};
