const express = require("express");
const { check } = require("express-validator");
const jwt = require("jsonwebtoken");
const serviceController = require("../Controllers/serviceController.js");
const checkRole = require("../Middlewares/roleMiddleware.js");
const authMiddleware = require("../Middlewares/authMiddleware.js");

const router = express.Router();

router.post(
  "/addservice",
  [
    check("name", "Заполните поле").notEmpty(),
    check("decription", "Заполните поле").notEmpty(),
    check("price", "Заполните поле").notEmpty(),
  ],
  authMiddleware,
  checkRole("ADMIN"),
  serviceController.addService
);
router.get("/getservices", serviceController.getServices);
router.get("/getservbyid/:id", serviceController.getServById);
router.put(
  "/updserv/:id",
  authMiddleware,
  checkRole("ADMIN"),
  serviceController.updServ
);
router.delete(
  "/delserv/:id",
  authMiddleware,
  checkRole("ADMIN"),
  serviceController.delServ
);

router.get("/categories", serviceController.getCategories);
router.get("/serviceByCategory", serviceController.getServicesByCategory);

module.exports = router;
