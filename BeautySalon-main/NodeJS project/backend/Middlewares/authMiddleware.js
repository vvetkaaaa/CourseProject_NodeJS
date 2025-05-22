const jwt = require("jsonwebtoken");
const secret = process.env.ACCESS_TOKEN_SECRET;

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    next();
  }
  // Проверка наличия заголовка Authorization
  if (!req.headers.authorization) {
    return res.status(403).json({ message: "Authorization header is missing" });
  }

  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }
    const decodedData = jwt.verify(token, secret);
    console.log("Decoded token data:", decodedData);
    console.log(decodedData.userID);
    if (!decodedData.userID) {
      console.log("User ID is missing from decoded token data.");
      return res.status(403).json({ message: "Пользователь не авторизован" });
    }

    //req.user = decodedData;
    req.user = { id: decodedData.userID,
                  role: decodedData.role
     };

    console.log('Middleware: Attaching user to req:', req.user); // Лог для проверки
    next();
  } catch (error) {
    console.error("Middleware: Ошибка верификации токена:", error.message); // Логируем саму ошибку
    // Обработка разных ошибок JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Невалидный токен" });
    } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Срок действия токена истек" });
    } else {
        return res.status(403).json({ message: "Ошибка авторизации" });
    }}
};
