const express = require('express')
const morgan = require('morgan');

const rfs = require('rotating-file-stream');
const fs = require('fs');
const path = require('path');

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    size: '10M',    // or rotate when it reaches 10MB
    path: path.join(__dirname, 'logs'),
    compress: 'gzip' // optional: compress older logs
}, { flags: 'a' });

const app = express()
app.use(express.json())

app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/projects', require('./routes/project'))
app.use('/api/users', require('./routes/user'))
app.use('/api/project', require('./routes/project-members'))
app.use('/api/tasks', require('./routes/task'))

app.use((req, res, next) => {
    const error = new Error("Resource not found");
    error.status = 404
    next(error)
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
        error: {
            message: err.message
        }
    })
})

module.exports = app