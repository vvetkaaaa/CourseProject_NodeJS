const { PrismaClient } = require("@prisma/client");
const Client = new PrismaClient();
module.exports = { Client };
