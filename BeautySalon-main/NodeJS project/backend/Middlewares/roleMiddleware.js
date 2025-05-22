const jwt = require("jsonwebtoken");
const secret = process.env.ACCESS_TOKEN_SECRET;

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }

    try {
      const token = req.headers.authorization.split(" ")[1];
      console.log(token);
      if (!token) {
        console.log("Пользователь не авторизован");
        return res.status(403).json({ message: "Пользователь не авторизован" });
      }

      const decoded = jwt.verify(token, secret);
      if (decoded.role !== role) {
        console.log("Нет доступа к выполнению операции");
        return res
          .status(403)
          .json({ message: "Нет доступа к выполнению операции" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Не авторизован" });
      console.log("Не авторизован");
    }
  };
};
