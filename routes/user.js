const express = require('express')
const UserController = require('../controllers/userController')
const authenticateToken = require('../middlewares/authenticateToken')

const router = express.Router()

router.get('/', authenticateToken, UserController.index)

router.post('/store', authenticateToken, UserController.store)

module.exports = router