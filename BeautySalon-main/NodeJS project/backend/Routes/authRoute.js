const express = require("express");
//const Router = require('express');
//const AuthValidator = require("../Validators/auth.js");
const { check } = require("express-validator");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../Middlewares/authMiddleware.js");
const roleMiddleware = require("../Middlewares/roleMiddleware.js");
const authController = require("../Controllers/authController.js");

const router = express.Router();

//router.get("/currentUser", authMiddleware, AuthController.currentUser);
router.get("/getuser", authMiddleware, authController.getUserData);

router.post(
  "/registration",
  [
    check("name", "Имя пользователя не может быть пустым")
      .notEmpty()
      .isLength({ min: 2, max: 15 }),
    check("phone", "Введите номер телефона").notEmpty(),
    check("email", "Введите правильный email").notEmpty().isEmail(),
    check("password", "Пароль должен быть 8 символов")
      .notEmpty()
      .isLength({ min: 7, max: 9 }),
  ],
  authController.registration
);
router.put(
  "/upduser/:id",
  [
    check("name", "Имя пользователя не может быть пустым")
      .notEmpty()
      .isLength({ min: 2, max: 15 }),
    check("phone", "Введите номер телефона").notEmpty(),
    check("email", "Введите правильный email").notEmpty().isEmail(),
  ],
  authMiddleware,
  authController.updateUser
);
router.delete("/deluser/:id", authMiddleware, authController.deleteUser);
router.post(
  "/login",
  [check("email", "Введите правильный email").notEmpty().isEmail()],
  authController.login
);
router.post("/logout", authMiddleware, authController.logOut);

module.exports = router;
