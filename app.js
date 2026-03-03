const express = require('express')

const app = express()

app.use(express.json())

const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/project')
const userRoutes = require('./routes/user')
const projectMembersRoutes = require('./routes/project-members')

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/users', userRoutes)
app.use('/api/project-members', projectMembersRoutes)

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