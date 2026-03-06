require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: process.env.DB_CONNECTION,
        port: process.env.DB_PORT,
        logging: false
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: process.env.DB_CONNECTION,
        port: process.env.DB_PORT,
        logging: false
    },
    production: {
        username: null,
        password: null,
        database: null,
        host: null,
        dialect: null,
        port: process.env.DB_PORT,
        logging: false
    }
};