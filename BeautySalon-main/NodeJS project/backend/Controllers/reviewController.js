const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class reviewController {
  //добавление отзыва
  async addReview(req, res) {
    try {
      const { userID, employeeID, rating, comm } = req.body;

      if (!rating) {
        console.log("Оценка должна быть указана");
        return res.status(400).json({ message: "Оценка должна быть указана" });
      }
      const employee = await clientPr.employees.findFirst({
        where: {
          employeeID: employeeID,
        },
      });

      if (!employee) {
        return res.status(404).json({ message: "Сотрудник не найден" });
      }

      const newReview = await clientPr.reviews.create({
        data: {
          userID,
          employeeID,
          rating,
          comm,
        },
      });

      res.status(201).json({
        message: "Отзыв успешно добавлен",
        review: newReview,
      });
    } catch (error) {
      console.error("Ошибка добавления отзыва:", error);
      res.status(500).json({ message: "Ошибка добавления отзыва" });
    }
  }
  //получение отзывов по сотруднику
  async getReviewsByEmployee(req, res) {
    try {
      const employeeID = parseInt(req.params.id, 10);

      const employee = await clientPr.employees.findFirst({
        where: {
          employeeID: employeeID,
        },
      });

      if (!employee) {
        return res.status(404).json({ message: "Сотрудник не найден" });
      }

      const reviews = await clientPr.reviews.findMany({
        where: {
          employeeID: employeeID,
        },
        include: {
          user: true,
        },
      });

      res.status(200).json(reviews);
    } catch (error) {
      console.error("Ошибка получения отзывов о сотруднике: ", error);
      res
        .status(500)
        .json({ message: "Ошибка получения отзывов о сотруднике" });
    }
  }

  async getAverageRatingByEmployee(req, res) {
    try {
      const employeeID = parseInt(req.params.id, 10);

      if (isNaN(employeeID)) {
        return res.status(400).json({ message: "Недопустимый ID сотрудника" });
      }

      const averageRating = await clientPr.reviews.aggregate({
        where: {
          employeeID: employeeID,
        },
        _avg: {
          rating: true,
        },
      });
      const roundedAverageRating = averageRating._avg.rating
        ? averageRating._avg.rating.toFixed(2)
        : 0.0;

      res.status(200).json({ averageRating: roundedAverageRating });
    } catch (error) {
      console.error("Ошибка получения рейтинга сотрудника: ", error);
      res.status(500).json({ message: "Ошибка получения рейтинга сотрудника" });
    }
  }

  //удаление отзыва
  async delReview(req, res) {
    const { reviewId } = req.body;
    const loggedInUserId = req.user.id; // Получаем ID пользователя
    const loggedInUserRole = req.user.role; // <--- 1. ПОЛУЧАЕМ РОЛЬ ПОЛЬЗОВАТЕЛЯ
  
    console.log("Backend - Попытка удалить отзыв с ID (из тела):", reviewId, "Пользователь:", loggedInUserId, "Роль:", loggedInUserRole); // Добавили роль в лог
  
    if (!reviewId || isNaN(parseInt(reviewId, 10))) {
      console.log("Backend - Неверный идентификатор отзыва:", reviewId);
      return res.status(400).json({ error: "Неверный идентификатор отзыва" });
    }
  
    const parsedReviewId = parseInt(reviewId, 10);
  
    try {
      console.log("Backend - Поиск отзыва с ID:", parsedReviewId);
      const reviewToDelete = await clientPr.reviews.findUnique({
        where: {
          reviewID: parsedReviewId,
        },
      });
  
      console.log("Backend - Результат поиска отзыва:", reviewToDelete);
  
      if (!reviewToDelete) {
        return res.status(404).json({ error: "Отзыв не найден" });
      }
  
      console.log("Backend - ID пользователя отзыва:", reviewToDelete.userID, "ID авторизованного пользователя:", loggedInUserId, "Роль:", loggedInUserRole);
  
      if (reviewToDelete.userID !== loggedInUserId && loggedInUserRole !== 'ADMIN') {
        console.log(`Backend - Отказ в доступе: Пользователь ${loggedInUserId} (роль: ${loggedInUserRole}) не автор и не администратор.`);
        return res.status(403).json({ error: "У вас нет прав на удаление этого отзыва" });
      }

      console.log(`Backend - Доступ разрешен для пользователя ${loggedInUserId} (роль: ${loggedInUserRole}). Попытка удалить отзыв ${parsedReviewId}`);
      await clientPr.reviews.delete({
        where: {
          reviewID: parsedReviewId,
        },
      });
  
      console.log("Backend - Отзыв успешно удален (через тело):", parsedReviewId);
      res.status(200).json({ message: "Отзыв успешно удален (через тело)" });
    } catch (error) {
      console.error("Backend - Ошибка при удалении отзыва:", error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Отзыв не найден (ошибка P2025)" });
      } else {
        res.status(500).json({ error: "Ошибка при удалении отзыва" });
      }
    }
  }}

module.exports = new reviewController();
