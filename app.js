const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const rfs = require('rotating-file-stream');
const fs = require('fs');
const path = require('path');

const app = express()

// Sets 15+ security headers automatically
app.use(helmet({
    // APIs usually don't serve HTML, so CSP is less critical here
    contentSecurityPolicy: false, 
    // Keeps these essential for all environments
    strictTransportSecurity: {
        maxAge: 31536000,
        includeSubDomains: true,
    },
    hidePoweredBy: true, 
}));

// Allowing External CDNs (Bootstrap/Google Fonts)
// app.use(
//     helmet({
//         contentSecurityPolicy: {
//             directives: {
//                 ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//                 "script-src": ["'self'", "cdn.jsdelivr.net"], // Allow Bootstrap JS
//                 "style-src": ["'self'", "fonts.googleapis.com", "cdn.jsdelivr.net"], // Allow Fonts & Bootstrap CSS
//                 "font-src": ["'self'", "fonts.gstatic.com"], // Allow Google Fonts
//             },
//         },
//     })
// );

app.use(express.json())

// Rate limiter setup
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 'window'
    message: {message: 'Too many requests attempts.'},
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Logger setup
const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    size: '10M',    // or rotate when it reaches 10MB
    path: path.join(__dirname, 'logs'),
    compress: 'gzip' // optional: compress older logs
}, { flags: 'a' });

app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Prevent CORS error
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if(req.method === 'OPTION') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, PUT, DELETE, GET')
        return res.status(200).json({})
    }
    next();
})

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
        error: { message: err.message }
    })
})

module.exports = app