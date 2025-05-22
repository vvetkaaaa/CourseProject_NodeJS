const express = require("express");
//const Router = require('express');
//const AuthValidator = require("../Validators/auth.js");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../Middlewares/authMiddleware.js");
const roleMiddleware = require("../Middlewares/roleMiddleware.js");
const bookingController = require("../Controllers/bookingController.js");

const { getAllRegistrations } = require("../ws.js");

const router = express.Router();
router.get(
  "/getdate/:serviceID",
  authMiddleware,
  bookingController.getAvailableDatesForService
);

router.post('/booking',bookingController.addBooking);
router.get("/getbook", authMiddleware, bookingController.getUserRegistrations);

router.delete(
  "/delbook/:registrationID",
  authMiddleware,
  bookingController.cancelRegistration
);

router.get('/availability/:serviceID/:date', authMiddleware, bookingController.getEmployeesAndAvailability);
router.get("/getBookingsByEmpl/:employeeID", bookingController.getBookingsByEmployeeID);
router.get("/statistics", bookingController.getBookingStatsByDateRange);


//тест
router.get("/getallreg", getAllRegistrations);

module.exports = router;
