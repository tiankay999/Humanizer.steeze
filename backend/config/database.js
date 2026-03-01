const { Sequelize } = require("sequelize");
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize({
  dialect: "mysql",
  database: process.env.DB_NAME || "humanizer",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || "3306",
  host: process.env.DB_HOST || "localhost",
});


module.exports = sequelize;

