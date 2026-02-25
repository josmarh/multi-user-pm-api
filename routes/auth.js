const express = require('express')
const AuthController = require('../controllers/authController')

const router = express.Router()

router.post('/register', AuthController.register)

router.post('/login', AuthController.login)

router.post('/logout', AuthController.logout)

router.post('/refresh-token', AuthController.refreshToken)

module.exports = router