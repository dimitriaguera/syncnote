const mongodb = require('../db/mongodb');

module.exports = {
  _nodeStream: (pipe = []) => {
    return mongodb
      .getDb()
      .collection('node')
      .watch(pipe);
  }
};
