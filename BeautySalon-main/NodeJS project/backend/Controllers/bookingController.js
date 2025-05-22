const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const secret = process.env.ACCESS_TOKEN_SECRET;
const dayjs = require("dayjs");
const { startOfDay } = require('date-fns');
const dateFnsTz = require('date-fns-tz');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
//const utcToZonedTime = dateFnsTz.utcToZonedTime;
//const zonedTimeToUtc = dateFnsTz.zonedTimeToUtc;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

class bookingController {
  async getAvailableDatesForService(req, res) {
    try {
      const { serviceID } = req.params;
      if (!serviceID) {
        return res.status(400).json({ message: "Требуется идентификатор услуги" });
      }
  
      // Сначала находим ID сотрудников, которые эту услугу оказывают
      const employees = await clientPr.employees.findMany({
        where: {
          services: {
            some: {
              serviceID: parseInt(serviceID, 10),
            },
          },
        },
        select: {
          employeeID: true,
        },
      });
  
      const employeeIDs = employees.map(e => e.employeeID);
      if (employeeIDs.length === 0) {
        return res.status(404).json({ message: "Сотрудников для указанной услуги не найдено" });
      }
  
      // Берём даты из Availability (а не Schedule)
      const availabilities = await clientPr.availability.findMany({
        where: {
          employeeID: { in: employeeIDs },
          date: { gte: new Date() },       // только сегодня и дальше
        },
        select: {
          date: true,
        },
        distinct: ["date"],
      });
  
      if (availabilities.length === 0) {
        return res.status(404).json({ message: "Нет доступных дат" });
      }
  
      const uniqueDates = availabilities.map(a => a.date);
      res.status(200).json({
        message: "Доступные даты успешно получены.",
        dates: uniqueDates,
      });
    } catch (error) {
      console.error("Ошибка при получении доступных дат:", error);
      res.status(500).json({ message: "Ошибка при получении доступных дат" });
    }
  }


  async getTimeSlotsForDate(req, res) {
    try {
      const { date } = req.params;
  
      if (!date) {
        return res.status(400).json({ message: "Требуется параметр даты" });
      }

      const selectedDate = dayjs(parseInt(date)).tz('Europe/Moscow');

      const localStart = selectedDate.startOf('day').toDate();
      const localEnd = selectedDate.endOf('day').toDate();
  
      const timeSlots = await clientPr.schedule.findMany({
        where: {
          date: {
            gte: localStart,
            lte: localEnd,
          },
        },
      });
  
      res.status(200).json({
        message: "Time slots успешно получены",
        date: localStart.toISOString().split("T")[0],
        timeSlots: timeSlots,
      });
    } catch (error) {
      console.error("Ошибка получения time slots:", error);
      res.status(500).json({ message: "Ошибка получения time slots" });
    }
  }


async getEmployeesAndAvailability(req, res) {
  try {
    const { serviceID, date } = req.params;

    const serviceIdInt = parseInt(serviceID, 10);

    if (isNaN(serviceIdInt) || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        message: "Требуется корректный идентификатор услуги и дата в формате YYYY-MM-DD.",
      });
    }

    const service = await clientPr.servics.findUnique({
      where: { serviceID: serviceIdInt },
      select: { duration: true },
    });

    if (!service) {
      return res.status(404).json({ message: "Услуга не найдена." });
    }

    const serviceDuration = service.duration;

    const queryDate = dayjs.tz(date, "YYYY-MM-DD", "Europe/Moscow").startOf('day');
    const queryDateStartUtc = queryDate.toDate();
    const queryDateEndUtc = queryDate.endOf('day').toDate();

    const employeesProvidingService = await clientPr.employees.findMany({
      where: {
        services: {
          some: {
            serviceID: serviceIdInt,
          },
        },
        availability: {
          some: {
            date: {
              gte: queryDateStartUtc,
              lte: queryDateEndUtc,
            },
          },
        },
      },
      select: {
        employeeID: true,
        name: true,
        surname: true,
        availability: {
          where: {
            date: {
              gte: queryDateStartUtc,
              lte: queryDateEndUtc,
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        },
        bookings: {
          where: {
            OR: [
              {
                startTime: {
                  gte: queryDateStartUtc,
                  lte: queryDateEndUtc,
                },
              },
              {
                endTime: {
                  gte: queryDateStartUtc,
                  lte: queryDateEndUtc,
                },
              },
              {
                AND: [
                  { startTime: { lte: queryDateStartUtc } },
                  { endTime: { gte: queryDateEndUtc } },
                ],
              },
            ],
          },
          select: {
            startTime: true,
            endTime: true,
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      },
    });

    const resultEmployees = [];

    for (const emp of employeesProvidingService) {
      if (!emp.availability || emp.availability.length === 0) continue;

      const existingBookings = emp.bookings.map(b => ({
        start: dayjs(b.startTime).tz("Europe/Moscow"),
        end: dayjs(b.endTime).tz("Europe/Moscow"),
      }));

      const availableSlots = [];

      for (const interval of emp.availability) {
        const workStart = dayjs(interval.startTime).tz("Europe/Moscow");
        const workEnd = dayjs(interval.endTime).tz("Europe/Moscow");

        if (workStart.isAfter(workEnd)) continue;

        let potentialSlotStart = workStart.clone();

        while (true) {
          const potentialSlotEnd = potentialSlotStart.clone().add(serviceDuration, 'minute');

          if (potentialSlotEnd.isAfter(workEnd)) break;

          const isOverlapping = existingBookings.some(booking =>
            potentialSlotStart.isBefore(booking.end) &&
            potentialSlotEnd.isAfter(booking.start)
          );

          if (!isOverlapping) {
            availableSlots.push(potentialSlotStart.format('HH:mm'));
          }

          potentialSlotStart = potentialSlotStart.add(serviceDuration, 'minute');
        }
      }

      if (availableSlots.length > 0) {
        resultEmployees.push({
          employeeID: emp.employeeID,
          name: emp.name,
          surname: emp.surname,
          availableSlots: availableSlots,
        });
      }
    }

    res.status(200).json({ employees: resultEmployees });

  } catch (error) {
    console.error("Ошибка при получении данных о мастерах и времени:", error);
    res.status(500).json({ message: "Ошибка на сервере: " + error.message });
  }
}

  async getEmployeesAndTimeForDate(req, res) {
    try {
      const { serviceID, date } = req.params;
  
      if (!serviceID || !date) {
        return res.status(400).json({
          message: "Требуется идентификатор услуги и дата.",
        });
      }
  
      const parsedDate = new Date(date);
      parsedDate.setUTCHours(0, 0, 0, 0); // начало дня
      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999); // конец дня
  
      const employeesWithSchedule = await clientPr.employees.findMany({
        where: {
          services: {
            some: {
              serviceID: parseInt(serviceID, 10),
            },
          },
          availability: {
            some: {
              date: {
                gte: parsedDate,
                lte: endOfDay,
              },
            },
          },
        },
        select: {
          employeeID: true,
          name: true,
          surname: true,
          availability: {
            where: {
              date: {
                gte: parsedDate,
                lte: endOfDay,
              },
            },
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
      });
  
      res.status(200).json({ employees: employeesWithSchedule });
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      res.status(500).json({ message: "Ошибка при получении данных" });
    }
  }

  async addBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Неверно введены данные валидации", errors: errors.array() });
      }

      const { userID, employeeID, serviceID, date, startTime: startTimeStr, notes } = req.body;

      if (!userID || !employeeID || !serviceID || !date || !startTimeStr) {
        return res.status(400).json({ message: "Все обязательные поля (userID, employeeID, serviceID, date, startTime) должны быть заполнены" });
      }

      const serviceIdInt = parseInt(serviceID, 10);
      const employeeIdInt = parseInt(employeeID, 10);
      const userIdInt = parseInt(userID, 10);

      if (isNaN(serviceIdInt) || isNaN(employeeIdInt) || isNaN(userIdInt)) {
          return res.status(400).json({ message: "ID пользователя, мастера или услуги некорректны." });
      }

      const service = await clientPr.servics.findUnique({
        where: { serviceID: serviceIdInt },
        select: { duration: true },
      });

      if (!service) {
        return res.status(404).json({ message: "Услуга не найдена." });
      }
      const serviceDuration = service.duration;

      const [hours, minutes] = startTimeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          return res.status(400).json({ message: "Некорректный формат времени начала." });
      }
      
      const bookingStartDateTimeLocal = dayjs(Number(date))
        .tz('Europe/Moscow')
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0);

      const bookingStartDateTimeUtc = bookingStartDateTimeLocal.toDate();
      const bookingEndDateTimeUtc = bookingStartDateTimeLocal.add(serviceDuration, 'minute').toDate();

      // Финальная проверка доступности слота
      const bookingDayQueryStartUtc = dayjs(bookingStartDateTimeUtc).startOf('day').toDate();
      const bookingDayQueryEndUtc = dayjs(bookingStartDateTimeUtc).endOf('day').toDate();
      
      const employeeAvailability = await clientPr.availability.findFirst({
        where: {
          employeeID: employeeIdInt,
          date: { // Поле 'date' в Availability должно быть началом дня UTC для мастера
            gte: bookingDayQueryStartUtc,
            lte: bookingDayQueryEndUtc,
           },
          startTime: { lte: bookingStartDateTimeUtc }, // Рабочее время начинается до или в момент начала брони
          endTime: { gte: bookingEndDateTimeUtc },   // Рабочее время заканчивается после или в момент конца брони
        },
      });

      if (!employeeAvailability) {
        return res.status(400).json({ message: "Выбранное время выходит за рамки рабочего времени мастера или мастер недоступен в этот день." });
      }

      const overlappingBooking = await clientPr.booking.findFirst({
        where: {
          employeeID: employeeIdInt,
          NOT: {
            // Если бы был режим редактирования, здесь можно было бы исключить текущую бронь
            // bookingID: isEditing ? currentBookingId : undefined 
          },
          // (SlotStart < BookingEnd) and (SlotEnd > BookingStart)
          startTime: { lt: bookingEndDateTimeUtc },
          endTime: { gt: bookingStartDateTimeUtc },
        },
      });

      if (overlappingBooking) {
        return res.status(409).json({ message: "Выбранное время уже занято. Пожалуйста, выберите другое время." });
      }

      const newBooking = await clientPr.booking.create({
        data: {
          userID: userIdInt,
          employeeID: employeeIdInt,
          serviceID: serviceIdInt,
          startTime: bookingStartDateTimeUtc,
          endTime: bookingEndDateTimeUtc,
          notes: notes || null,
        },
      });

      res.status(201).json({
        message: "Запись успешно добавлена",
        booking: newBooking,
      });
      console.log("Запись успешно добавлена:", newBooking);

    } catch (error) {
      console.error("Ошибка при добавлении записи:", error);
      if (error.code === 'P2003') { // Foreign key constraint failed
          if (error.meta?.field_name?.includes('userID')) {
              return res.status(400).json({ message: "Пользователь не найден." });
          }
          if (error.meta?.field_name?.includes('employeeID')) {
              return res.status(400).json({ message: "Мастер не найден." });
          }
          if (error.meta?.field_name?.includes('serviceID')) {
              return res.status(400).json({ message: "Услуга не найдена." });
          }
      }
      res.status(500).json({ message: "Ошибка на сервере при добавлении записи: " + error.message });
    }
  }

  //получение инфы
  async getUserRegistrations(req, res) {
    try {
      const userID = req.user.id;

      if (!userID) {
        return res.status(400).json({ message: "ID пользователя не найден" });
      }
  
      const bookings = await clientPr.booking.findMany({
        where: {
          userID: userID,
          startTime: {
            gte: new Date(), // Будущие записи
          },
        },
        include: {
          employee: true,
          service: true,
        },
      });
  
      if (!bookings || bookings.length === 0) {
        return res.status(404).json({ message: "Записи на услуги не найдены" });
      }
  
      const formattedBookings = bookings.map((booking) => ({
        registrationID: booking.bookingID,
        date: booking.startTime.toLocaleDateString("ru-RU"),
        time: booking.startTime.toLocaleTimeString("ru-RU", {
          timeZone: "Europe/Moscow",
          hour: "2-digit",
          minute: "2-digit",
        }),
        service: booking.service.name,
        employee: `${booking.employee.name} ${booking.employee.surname}`,
      }));
  
      res.status(200).json({
        message: "Информация о записях на услуги получена успешно",
        registrations: formattedBookings,
      });
    } catch (error) {
      console.error("Ошибка при получении информации о записях на услуги:", error);
      res.status(500).json({
        message: "Ошибка при получении информации о записях на услуги",
      });
    }
  }

  async cancelRegistration(req, res) {
    try {
      const { registrationID } = req.params;
      console.log("Идентификатор брони:", registrationID);
  
      const booking = await clientPr.booking.findUnique({
        where: {
          bookingID: parseInt(registrationID, 10),
        },
      });
  
      if (!booking) {
        console.log("Бронирование не найдено");
        return res.status(404).json({ message: "Бронирование не найдено" });
      }
  
      const { employeeID, startTime, endTime } = booking;
  
      // Устанавливаем дату на начало дня в часовой зоне Europe/Moscow
      const moscowDate = new Date(startTime);
      moscowDate.setUTCHours(3, 0, 0, 0); // Приведение к началу дня
  
      await clientPr.availability.create({
        data: {
          employee: {
            connect: { employeeID },
          },
          date: moscowDate,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      });
  
      await clientPr.booking.delete({
        where: {
          bookingID: booking.bookingID,
        },
      });
  
      res.status(200).json({
        message: "Бронирование успешно отменено",
      });
      console.log("Бронирование успешно отменено");
    } catch (error) {
      console.error("Ошибка при отмене бронирования:", error);
      res.status(400).json({ message: "Ошибка при отмене бронирования" });
    }
  }


  //Получения записей для конкретного мастера
  async getBookingsByEmployeeID(req, res) {
  try {
    const { employeeID } = req.params;

    if (!employeeID || isNaN(parseInt(employeeID))) {
      return res.status(400).json({ message: "Некорректный идентификатор сотрудника." });
    }

    const bookings = await clientPr.booking.findMany({
      where: {
        employeeID: parseInt(employeeID, 10),
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

    if (bookings.length === 0) {
      return res.status(404).json({ message: "Записей для указанного сотрудника не найдено." });
    }

    const formattedBookings = bookings.map((booking) => ({
      bookingID: booking.bookingID,
      date: booking.startTime.toLocaleDateString("ru-RU"),
      time: booking.startTime.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endTime: booking.endTime.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      service: booking.service.name,
      duration: booking.service.duration,
      notes: booking.notes,
      clientName: booking.user.name,
    }));

    res.status(200).json({
      message: "Записи сотрудника получены успешно.",
      bookings: formattedBookings,
    });

  } catch (error) {
    console.error("Ошибка при получении записей по сотруднику:", error);
    res.status(500).json({ message: "Ошибка сервера при получении записей по сотруднику." });
  }
}


async getBookingStatsByDateRange(req, res) {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Необходимо указать начальную и конечную дату." });
    }

    const startOfDay = new Date(startDate);
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
         return res.status(400).json({ message: "Некорректный формат даты." });
    }

    const bookingCounts = await clientPr.booking.groupBy({
      by: ['employeeID'],
      _count: {
        bookingID: true,
      },
      where: {
        startTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (bookingCounts.length === 0) {
        return res.status(200).json({ message: "Записей в выбранном диапазоне не найдено.", stats: [] });
    }

    const employeeIdsWithBookings = bookingCounts.map(item => item.employeeID);
    const employees = await clientPr.employees.findMany({
        where: {
            employeeID: {
                in: employeeIdsWithBookings
            }
        },
         select: {
            employeeID: true,
            name: true,
            surname: true,
         }
    });

    const employeeStats = employees.map(employee => {
        const countData = bookingCounts.find(item => item.employeeID === employee.employeeID);
        return {
            employeeId: employee.employeeID,
            name: employee.name,
            surname: employee.surname,
            bookingCount: countData ? countData._count.bookingID : 0
        };
    });

    res.status(200).json({
      message: "Статистика записей получена успешно.",
      stats: employeeStats,
    });

  } catch (error) {
    console.error("Ошибка при получении статистики записей по датам:", error);
    res.status(500).json({ message: "Ошибка сервера при получении статистики записей." });
  }
}
}

module.exports = new bookingController();
