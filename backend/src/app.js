require('dotenv').config();

const express = require('express');
const cors = require('cors');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api', router);

app.use(errorHandler);

module.exports = app;
