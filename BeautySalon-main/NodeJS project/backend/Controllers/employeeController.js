const express = require("express");
const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const dayjs = require("dayjs");
require("dayjs/plugin/utc");
require("dayjs/plugin/timezone");
dayjs.extend(require("dayjs/plugin/utc"));
dayjs.extend(require("dayjs/plugin/timezone"));
const TIMEZONE = 'Europe/Moscow';
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function convertToISO(date, time) {
  const dateTimeString = `${date}T${time}:00Z`;
  const dateTime = dayjs(dateTimeString);
  return dateTime.toISOString();
}

class employeeController {
  
  //Получить всех сотрудников
  async getEmployees(req, res) {
    try {
        const employees = await clientPr.employees.findMany({
            include: {
                services: {
                    include: {
                        service: true, // Включаем данные об услугах
                    },
                },
            },
        });

        const employeeWithPhoto = employees.map((employee) => ({
            id: employee.employeeID,
            name: employee.name,
            surname: employee.surname,
            phone: employee.phone,
            email: employee.email,
            services: employee.services.map(
                (empService) => empService.service.name
            ),
            // Преобразуем поле photo (Bytes) в Base64 для отображения
            photoBase64: employee.photo ? Buffer.from(employee.photo).toString('base64') : null,
        }));

        res.status(200).json(employeeWithPhoto);
    } catch (error) {
        console.error("Ошибка получения сотрудников:", error);
        res.status(500).json({ message: "Ошибка получения сотрудников" });
    }
}

  //Получить сотрудника по услуге
  async getEmployeesByService(req, res) {
    try {
      const { serviceID } = req.params;
      const parsedServiceID = parseInt(serviceID, 10);

      console.log(parsedServiceID);

      if (!serviceID) {
        return res
          .status(400)
          .json({ message: "Требуется идентификатор услуги." });
      }

      const employees = await clientPr.employees.findMany({
        where: {
          services: {
            some: {
              serviceID: parsedServiceID,
            },
          },
        },
        select: {
          employeeID: true,
          name: true,
          surname: true,
        },
      });

      if (employees.length === 0) {
        return res
          .status(404)
          .json({ message: "Сотрудников для указанной услуги не найдено" });
      }

      res.status(200).json({
        message: "Сотрудники получены успешно",
        employees: employees,
      });
    } catch (error) {
      console.error("Ошибка получения сотрудников по сервису: ", error);
      res
        .status(500)
        .json({ message: "Ошибка получения сотрудников по сервису" });
    }
  }

//Добавить сотрудника
async addEmployee(req, res) {
    upload.single('photo')(req, res, async (err) => {
      if (err) {
        console.error("Ошибка загрузки файла:", err);
        return res.status(500).json({ message: "Ошибка загрузки файла" });
      }
  
      try {
        const { name, surname, email, serviceCategories, services, availabilities } = req.body;
        const photo = req.file ? req.file.buffer : null;
  
        if (!name || !surname || !email || !serviceCategories || !services) {
          return res.status(400).json({
            message: "Пожалуйста, заполните все обязательные поля (имя, фамилия, email, категории услуг и услуги)."
          });
        }
  
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Некорректный email" });
        }
  
        const existingEmployee = await clientPr.employees.findFirst({
          where: { email }
        });
  
        if (existingEmployee) {
          return res.status(409).json({ message: "Сотрудник с таким email уже существует" });
        }
  
        const newEmployee = await clientPr.employees.create({
          data: {
            name,
            surname,
            email,
            photo,
            serviceCategories: {
              create: JSON.parse(serviceCategories).map((categoryID) => ({
                serviceCategoryID: categoryID,
              })),
            },
            services: {
              create: JSON.parse(services)
                .map(Number)
                .filter(Number.isInteger)
                .map((serviceID) => ({ serviceID })),
            },
          },
          include: {
            serviceCategories: true,
            services: true,
          },
        });
  
        // Обработка availabilities
        if (availabilities) {
          let parsedAvailabilities;
          try {
            parsedAvailabilities = JSON.parse(availabilities);
          } catch (parseError) {
            return res.status(400).json({ message: "Некорректный формат availabilities" });
          }

          if (Array.isArray(parsedAvailabilities) && parsedAvailabilities.length > 0) {
            const validSlots = parsedAvailabilities.filter(
              (slot) => slot.date && slot.startTime && slot.endTime
            );

            if (validSlots.length === 0) {
              // Просто пропускаем — расписание не задано
              console.log("Расписание не указано — добавим позже при необходимости.");
            } else {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const availabilitySlots = validSlots.map((slot) => {
                const { date, startTime, endTime } = slot;

                const dateObj = new Date(date);
                const startDateTime = new Date(startTime);
                const endDateTime = new Date(endTime);

                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime()) || isNaN(dateObj.getTime())) {
                  throw new Error("Некорректный формат даты или времени в расписании.");
                }

                if (dateObj < today) {
                  throw new Error("Нельзя установить интервал доступности на прошедшую дату.");
                }

                if (startDateTime >= endDateTime) {
                  throw new Error("Время начала должно быть раньше времени окончания.");
                }

                return {
                  employeeID: newEmployee.employeeID,
                  date: dateObj,
                  startTime: startDateTime,
                  endTime: endDateTime,
                };
              });

              await clientPr.availability.createMany({ data: availabilitySlots });
            }
          }
        }
  
        res.status(201).json({
          message: "Сотрудник успешно добавлен",
          employee: newEmployee,
        });
  
      } catch (error) {
        console.error("Ошибка добавления сотрудника:", error);
        if (error.message) {
          return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Ошибка добавления сотрудника" });
      }
    });
  }


  //Удалить усотрудника
  async delEmployee(req, res) {
    const employeeId = parseInt(req.params.id, 10);

    if (isNaN(employeeId)) {
      return res.status(400).json({ error: "Неверный идентификатор отзыва" });
    }

    try {
      await clientPr.availability.deleteMany({
        where: {
          employeeID: employeeId,
        },
      });

      const deletedEmployee = await clientPr.employees.delete({
        where: {
          employeeID: employeeId,
        },
      });

      res
        .status(200)
        .json({ message: "Сотрудник удален успешно", deletedEmployee });
    } catch (error) {
      if (error.code === "P2025") {
        res.status(404).json({ error: "Сотрудник не найден" });
      } else {
        console.error("Ошибка при удалении сотрудника:", error);
        res.status(500).json({ error: "Ошибка при удалении сотрудника" });
      }
    }
  }


  //Обновить информацию сотрудника
  async updateEmployee(req, res) {
    upload.single("photo")(req, res, async (err) => {
        if (err) {
            console.error("Ошибка загрузки фотографии:", err);
            return res.status(500).json({ message: "Ошибка загрузки фотографии" });
        }

        try {
            const employeeID = parseInt(req.params.id, 10);
            const { name, surname, email, serviceCategories, services, availabilities } = req.body;
            const photo = req.file ? req.file.buffer : undefined;

            if (!name || !surname || !email) {
                return res.status(400).json({ message: "Имя, фамилия и email обязательны для обновления." });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Некорректный email." });
            }

            // Формируем объект для обновления
            const updateData = { name, surname, email };
            if (photo) updateData.photo = photo;

            const updatedEmployee = await clientPr.employees.update({
                where: { employeeID },
                data: updateData,
            });

            const parsedServiceCategories = typeof serviceCategories === 'string' ? JSON.parse(serviceCategories) : serviceCategories;
            const parsedServices = typeof services === 'string' ? JSON.parse(services) : services;
            //const parsedAvailabilities = typeof availabilities === 'string' ? JSON.parse(availabilities) : availabilities;

            // Обновление услуг
              if (Array.isArray(parsedServices)) {
                await clientPr.employeesServices.deleteMany({ where: { employeeID } });
                const validServiceIDs = parsedServices.map(Number).filter(Number.isInteger);
                if (validServiceIDs.length > 0) {
                    await clientPr.employeesServices.createMany({
                        data: validServiceIDs.map(serviceID => ({ employeeID, serviceID })),
                        skipDuplicates: true,
                    });
                }
              }

              // Обновление категорий
              if (Array.isArray(parsedServiceCategories)) {
                await clientPr.employeesServiceCategories.deleteMany({ where: { employeeID } });
                const validCategoryIDs = parsedServiceCategories.map(Number).filter(Number.isInteger);
                if (validCategoryIDs.length > 0) {
                    await clientPr.employeesServiceCategories.createMany({
                        data: validCategoryIDs.map(serviceCategoryID => ({ employeeID, serviceCategoryID })),
                        skipDuplicates: true,
                    });
                }
              }

            // Обновление интервалов доступности
            if (availabilities && Array.isArray(JSON.parse(availabilities)) && JSON.parse(availabilities).length > 0) {
                const availabilitySlotsToCreate = [];
                let error = false;

                // Удаляем старые интервалы доступности
                await clientPr.availability.deleteMany({ where: { employeeID } });

                // Перебираем новые интервалы и добавляем их в базу
                for (const availability of JSON.parse(availabilities)) {
                    const { date, startTime, endTime } = availability;

                    if (!date || !startTime || !endTime) {
                        error = true;
                        console.log("Не все поля интервала доступности заполнены");
                        return res.status(400).json({ message: "Пожалуйста, заполните дату, время начала и окончания для интервала доступности." });
                    }

                    const startDate = new Date(date);
                    const startDateTime = new Date(startTime);
                    const endDateTime = new Date(endTime);

                    if (startDate < new Date().setHours(0, 0, 0, 0)) {
                        error = true;
                        console.log("Недопустимая дата");
                        return res.status(400).json({ message: "Вы не можете установить интервал доступности на прошедшую дату." });
                    }

                    if (startDateTime >= endDateTime) {
                        error = true;
                        console.log("Недопустимое время начала и окончания");
                        return res
                            .status(400)
                            .json({ message: "Время начала интервала доступности должно быть раньше времени окончания." });
                    }

                    availabilitySlotsToCreate.push({
                        employeeID: updatedEmployee.employeeID,
                        date: new Date(date),
                        startTime: new Date(startTime),
                        endTime: new Date(endTime),
                    });
                }

                if (!error && availabilitySlotsToCreate.length > 0) {
                    await clientPr.availability.createMany({
                        data: availabilitySlotsToCreate,
                    });
                }
            }

            res.status(200).json({
                message: "Сотрудник успешно обновлён",
                employee: updatedEmployee,
            });
        } catch (error) {
            console.error("Ошибка при обновлении сотрудника:", error);
            res.status(500).json({ message: "Внутренняя ошибка сервера." });
        }
    });
}


//Получить сотрудника по id
async getEmployeeById(req, res) {
  try {
      const employeeID = parseInt(req.params.id, 10);

      const employee = await clientPr.employees.findFirst({
          where: { employeeID },
          include: {
              serviceCategories: {
                  include: {
                      serviceCategory: {
                          select: {
                              categoryID: true,
                              name: true,
                          },
                      },
                  },
              },
              services: {
                  include: {
                      service: {
                          select: {
                              serviceID: true,
                              name: true,
                              description: true,
                              price: true,
                          },
                      },
                  },
              },
              availability: { // Изменено с 'schedules' на 'availability'
                  select: {
                      availabilityID: true,  // assuming availabilityID exists
                      date: true,
                      startTime: true,
                      endTime: true,
                  },
              },
          },
      });

      if (!employee) {
          return res.status(404).json({ message: "Сотрудник не найден" });
      }

      // Форматируем данные для фронтенда, включая фото в Base64
      const formattedEmployee = {
          ...employee,
          serviceCategories: employee.serviceCategories.map(sc => ({
              categoryID: sc.serviceCategory.categoryID,
              name: sc.serviceCategory.name,
          })),
          services: employee.services.map(s => ({
              serviceID: s.service.serviceID,
              name: s.service.name,
              description: s.service.description,
              price: s.service.price,
          })),
          availability: employee.availability.map(availability => ({
              availabilityID: availability.availabilityID,
              date: availability.date,
              startTime: availability.startTime,
              endTime: availability.endTime,
          })),
          // Преобразуем поле photo (Bytes) в Base64 для отображения
          photoBase64: employee.photo ? Buffer.from(employee.photo).toString('base64') : null,
      };

      res.status(200).json(formattedEmployee);
  } catch (error) {
      console.error("Ошибка получения сотрудника по ID:", error);
      res.status(500).json({ message: "Ошибка получения сотрудника по ID" });
  }
}


    //Получить доступные слоты для записи
    async getAvailableDatesForEmployee(req, res) {
      try {
        const { employeeID } = req.params;

        if (!employeeID) {
          return res
            .status(400)
            .json({ message: "Требуется идентификатор сотрудника" });
        }

        const schedules = await clientPr.availability.findMany({
          where: {
            employeeID: parseInt(employeeID, 10),
            // date: {
            //   gte: new Date(new Date().setHours(0, 0, 0, 0)),
            // },
          },
          select: {
            date: true,
          },
          distinct: ["date"], // Уникальные даты
        });

        const availableDates = schedules.map((s) => s.date);

        res.status(200).json({
          message: "Доступные даты успешно получены.",
          dates: availableDates,
        });
      } catch (error) {
        console.error("Ошибка при получении доступных дат для сотрудника:", error);
        res.status(500).json({ message: "Ошибка сервера" });
      }
    }


  
  //получаем расписани мастеров
  async getMasterScheduleDaily(req, res) {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Необходимо указать дату в формате YYYY-MM-DD." });
    }

    const selectedDate = dayjs(date).tz(TIMEZONE);

    if (!selectedDate.isValid()) {
      return res.status(400).json({ message: "Некорректный формат даты." });
    }

    const startOfDay = selectedDate.startOf('day').toDate();
    const endOfDay = selectedDate.endOf('day').toDate();

    const employees = await clientPr.employees.findMany({
      select: {
        employeeID: true,
        name: true,
        surname: true,
        photo: true,
        availability: {
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            }
          },
          select: {
            startTime: true,
            endTime: true,
          },
          orderBy: {
            startTime: 'asc',
          }
        }
      }
    });

    if (!employees || employees.length === 0) {
      return res.status(200).json([]);
    }

    const scheduleData = [];

    for (const employee of employees) {
      const workTimes = employee.availability.map((slot) => ({
        startTime: dayjs(slot.startTime).tz(TIMEZONE).format('HH:mm'),
        endTime: dayjs(slot.endTime).tz(TIMEZONE).format('HH:mm'),
      }));

      const bookings = await clientPr.booking.findMany({
        where: {
          employeeID: employee.employeeID,
          startTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          service: {
            select: {
              name: true,
              duration: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      const formattedBookings = bookings.map((booking) => ({
        bookingId: booking.bookingID,
        startTime: dayjs(booking.startTime).tz(TIMEZONE).format('HH:mm'),
        endTime: dayjs(booking.endTime).tz(TIMEZONE).format('HH:mm'),
        serviceName: booking.service.name,
        clientName: booking.user.name,
        notes: booking.notes,
      }));

      scheduleData.push({
        id: employee.employeeID,
        name: employee.name,
        surname: employee.surname,
        photoBase64: employee.photo ? Buffer.from(employee.photo).toString('base64') : null,
        workTimes,
        bookings: formattedBookings,
      });
    }

    res.status(200).json(scheduleData);

  } catch (error) {
    console.error("Ошибка при получении расписания всех мастеров на дату:", error);
    res.status(500).json({ message: "Ошибка сервера при получении расписания мастеров." });
  }
}


  //Удалить расписание
  async delShedule(req, res) {
    const employeeID = parseInt(req.params.id, 10);

    if (isNaN(employeeID)) {
      return res.status(400).json({ message: "Неверный ID сотрудника" });
    }

    try {
      // Удаление Booking, если нужно очистить их тоже
      await clientPr.booking.deleteMany({
        where: { employeeID },
      });

      // Удаление Availability
      await clientPr.availability.deleteMany({
        where: { employeeID },
      });

      return res.json({ message: "Расписание и связанные записи удалены успешно." });
    } catch (error) {
      console.error("Ошибка при удалении расписания:", error);
      return res.status(500).json({ message: "Ошибка при удалении расписания." });
    }
  }

  async;
}

module.exports = new employeeController();
