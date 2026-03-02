const express = require('express')
const ProjectController = require('../controllers/projectController')
const authenticateToken = require('../middlewares/authenticateToken')

const router = express.Router()

router.get('/', authenticateToken, ProjectController.index)

router.post('/store', authenticateToken, ProjectController.store)

router.get('/show/:id', authenticateToken, ProjectController.show)

router.put('/update/:id', authenticateToken, ProjectController.update)

router.delete('/delete/:id', authenticateToken, ProjectController.destroy)

module.exports = router