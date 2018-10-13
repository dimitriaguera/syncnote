module.exports = {
  authByUserId: (req, res, next) => {
    if (!req.user || !req._userId || req.user._id !== req._userId) {
      res.status(403);
      res.send("Not permitted for this user.");
      return;
    }
    next();
  }
};
