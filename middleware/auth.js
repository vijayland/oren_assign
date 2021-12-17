const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (token) {
      const verifiedUser = jwt.verify(token, process.env.JWTSECRET);
      req.user = verifiedUser.user;
      next();
    } else {
      res.status(401).json({
        msg: "Unauthorized. Token required",
      });
    }
  } catch (error) {
    res.status(401).json({
      msg: "Something bad happend",
      error: error,
    });
  }
};
