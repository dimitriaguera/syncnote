const mongodb = require('../db/mongodb');

const ok = '234';

module.exports = {
  _nodeStream: (pipe = []) => {
    return mongodb
      .getDb()
      .collection('node')
      .watch(pipe);
  }
};
