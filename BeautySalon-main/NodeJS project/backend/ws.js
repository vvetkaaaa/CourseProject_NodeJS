const { PrismaClient } = require("@prisma/client");
const clientPr = new PrismaClient();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
  {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  {
    from: process.env.EMAIL_FROM,
  }
);

const sendMail = async (email, data) => {
  const text = `
       Уважаемый ${data.name},
       ${data.day}, ${data.time}, ждём вас на процедуре ${data.service}. Ваш мастер ${data.employee}
    `;
  const message = {
    to: email,
    subject: process.env.EMAIL_SUBJECT,
    text: text,
  };

  await transporter.sendMail(message, (err, info) => {
    if (err) return console.log(err);
    console.log("Email send: ", info);
  });
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await clientPr.registration.findMany({
      where: {
        dateTime: {
          gte: new Date(), // Фильтр для отбора записей не позднее текущего времени
        },
      },
      include: {
        employee: {
          include: {
            services: {
              include: {
                service: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Если записей о регистрации не найдено, вернуть пустой массив
    if (!registrations || registrations.length === 0) {
      return res.status(404).json({ message: "Записи на услуги не найдены" });
    }

    // Преобразование данных о регистрации в требуемый формат
    const formattedRegistrations = registrations.map((registration) => ({
      registrationID: registration.registrationID,
      date: registration.dateTime.toISOString().split("T")[0],
      time: registration.dateTime.toISOString().split("T")[1].slice(0, 5),
      service: registration.employee.services[0].service.name,
      employee: `${registration.employee.name} ${registration.employee.surname}`,
      user: {
        name: registration.user.name,
        email: registration.user.email,
      },
    }));

    return formattedRegistrations;
  } catch (error) {
    console.error(
      "Ошибка при получении информации о записях на услуги:",
      error
    );
  }
};
const getRandomTip = async (req, res) => {
  try {
    const allTips = await clientPr.tips.findMany();

    const randomIndex = Math.floor(Math.random() * allTips.length);
    const randomTip = allTips[randomIndex];

    if (randomTip) {
      console.log(randomTip);
      return randomTip.tip;
    }
  } catch (error) {
    console.error("Ошибка при получении случайной записи:", error);
  }
};
module.exports.getRandomTip = getRandomTip;

module.exports.sendMail = sendMail;
module.exports.getAllRegistrations = getAllRegistrations;
