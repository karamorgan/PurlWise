const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const PORT = process.env.PORT || 3000;

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.use('/dashboard', require('./routes/dashboardRoute'));
app.use('/register', require('./routes/registerRoute'));
app.use('/login', require('./routes/loginRoute'));
app.use('/setup', require('./routes/setupRoute'));
app.use('/pattern', require('./routes/patternRoute'));
app.use('/display', require('./routes/displayRoute'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));

