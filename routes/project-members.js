const express = require('express')
const ProjectMemberController = require('../controllers/projectMemberController')
const authenticateToken = require('../middlewares/authenticateToken')

const router = express.Router()

router.post('/', authenticateToken, ProjectMemberController.index)


module.exports = router