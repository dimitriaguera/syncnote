const mongodb = require('../db/mongodb');

ok = '2345';

module.exports = {
  _nodeStream: (pipe = []) => {
    return mongodb
      .getDb()
      .collection('node')
      .watch(pipe);
  }
};
