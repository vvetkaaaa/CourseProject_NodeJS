const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();

class serviceController {
  async addService(req, res) {
    const { name, description, price, categoryID, duration } = req.body;

    if (!name || price === undefined) { 
        console.log("Название услуги и цена обязательны");
        return res
            .status(400)
            .json({ error: "Название услуги и цена обязательны" });
    }

    try {
        const existingService = await clientPr.servics.findFirst({
            where: { name },
        });

        if (existingService) {
            console.log("Услуга с таким именем уже существует");
            return res
                .status(409)
                .json({ message: "Услуга с таким именем уже существует" });
        }

        const priceFormatted = parseFloat(price).toFixed(2);
        
        const serviceData = {
            name,
            description,
            price: priceFormatted,
            categoryID: categoryID ? parseInt(categoryID, 10) : null,
        };
        if (duration !== undefined && duration !== null && !isNaN(parseInt(duration, 10))) {
            serviceData.duration = parseInt(duration, 10);
        } else if (duration !== undefined && duration !== null) {
             console.log("Некорректное значение для длительности услуги.");
             return res
                .status(400)
                .json({ error: "Длительность услуги должна быть числом (в минутах)." });
        }


        const newService = await clientPr.servics.create({
            data: serviceData,
            include: {
                category: true,
            },
        });

        res
            .status(201)
            .json({ message: "Услуга добавлена успешно: ", service: newService });
        console.log("Услуга добавлена успешно: ", newService);
    } catch (error) {
        console.error("Ошибка при добавлении услуги:", error);
        if (error.code === 'P2003') {
             return res.status(400).json({ error: "Указанная категория услуги не существует." });
        }
        res.status(500).json({ error: "Ошибка на сервере при добавлении услуги" });
    }
}

  //получение услуг
  async getServices(req, res) {
    try {
      const services = await clientPr.servics.findMany();

      const servicesWithId = services.map((service) => ({
        id: service.serviceID,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
      }));
      res.status(200).json(servicesWithId);
    } catch (error) {
      console.error("Ошибка при получении услуг:", error);
      res.status(500).json({ error: "Ошибка при получении услуг" });
    }
  }

  //получение услуги по id
  async getServById(req, res) {
    const serviceID = parseInt(req.params.id, 10);
    console.log(serviceID);

    if (isNaN(serviceID)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }
    try {
      const service = await clientPr.servics.findFirst({
        where: {
          serviceID,
        },
      });
      const serviceData = {
        id: service.serviceID,
        name: service.name,
        description: service.description,
        price: service.price,
        category: service.categoryID,
        duration: service.duration,
      };

      if (!service) {
        return res.status(404).json({ error: "Услуга не найдена" });
      }

      res.status(200).json(serviceData);
    } catch (error) {
      console.error("Ошибка при получении услуги по id:", error);
      res.status(500).json({ error: "Ошибка при получении услуги по id" });
    }
  }


  async updServ(req, res) {
    const serviceID = parseInt(req.params.id, 10);
    
    if (isNaN(serviceID)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }
  
    const { name, description, price, categoryID, duration } = req.body; // Получаем categoryID из тела запроса

    console.log("Данные из запроса:", req.body);
  
    const updateData = {};
  
    if (name !== undefined) {
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (price !== undefined) {
      updateData.price = parseFloat(price).toFixed(2);
    }
    if (categoryID !== undefined) {
      updateData.categoryID = categoryID ? parseInt(categoryID) : null; // Добавляем categoryID в данные для обновления
    }
    if (duration !== undefined) {
      const parsedDuration = parseInt(duration, 10);
      if (!isNaN(parsedDuration)) {
        updateData.duration = parsedDuration;
      } else {
        return res
          .status(400)
          .json({ error: "Длительность должна быть числом (в минутах)" });
      }
    }
  
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Нет данных для обновления" });
    }
    try {
      const updatedService = await clientPr.servics.update({
        where: {
          serviceID,
        },
        data: updateData,
        include: {
          category: true, // Опционально: включить данные о категории в ответ
        },
      });
  
      console.log("Услуга обновлена успешно");
      res
        .status(200)
        .json({ message: "Услуга обновлена успешно", updatedService });
    } catch (error) {
      console.error("Ошибка при обновлении услуги:", error);
      res.status(500).json({ error: "Ошибка при обновлении услуги" });
    }
  }

  //удаление услуги
  async delServ(req, res) {
    const serviceId = parseInt(req.params.id, 10);

    if (isNaN(serviceId)) {
      return res.status(400).json({ error: "Неверный идентификатор услуги" });
    }

    try {
      const deletedService = await clientPr.servics.delete({
        where: {
          serviceID: serviceId,
        },
      });

      console.log("Услуга удалена успешно");
      res
        .status(200)
        .json({ message: "Услуга удалена успешно ", deletedService });
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Услуга не найдена" });
      } else {
        console.error("Ошибка при удалении услуги:", error);
        res.status(500).json({ error: "Ошибка при удалении услуги" });
      }
    }
  }

  //Метод для вывода всех категорий
  async getCategories(req, res) {
    try {
      const categories = await clientPr.serviceCategory.findMany();
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Ошибка при получении категорий:", error);
      return res.status(500).json({ message: "Не удалось получить категории" });
    }
  }

  //Метод для вывода услуг по категориям
  async getServicesByCategory(req, res) {
    const categoryIDsString = req.query.categoryIDs;
  
    if (!categoryIDsString) {
      return res.status(400).json({ error: "Необходимо предоставить ID категорий" });
    }
  
    const categoryIDsArray = categoryIDsString.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  
    if (categoryIDsArray.length === 0) {
      return res.status(400).json({ error: "Предоставлены некорректные ID категорий" });
    }
  
    try {
      const services = await clientPr.servics.findMany({
        where: {
          categoryID: {
            in: categoryIDsArray,
          },
        },
      });
  
      const servicesWithId = services.map((service) => ({
        id: service.serviceID,
        name: service.name,
        description: service.description,
        price: service.price,
        categoryID: service.categoryID,
        duration: service.duration,
      }));
  
      res.status(200).json(servicesWithId);
    } catch (error) {
      console.error(
        `Ошибка при получении услуг для категорий ${categoryIDsString}:`,
        error
      );
      res
        .status(500)
        .json({
          error: `Ошибка при получении услуг для категорий ${categoryIDsString}`,
        });
    }
  //async;
}}

module.exports = new serviceController();
