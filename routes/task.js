const express = require('express')
const authenticateToken = require('../middlewares/authenticateToken')
const TaskController = require('../controllers/taskController')

const router = express.Router()

router.get('/', authenticateToken, TaskController.index)
router.post('/store', authenticateToken, TaskController.store)
router.get('/show/:id', authenticateToken, TaskController.show)
router.put('/update/:id', authenticateToken, TaskController.update)
router.delete('/delete/:id', authenticateToken, TaskController.destroy)
router.post('/assign/:taskId', authenticateToken, TaskController.assign_task)
router.post('/unassign/:taskId', authenticateToken, TaskController.unassign_task)

module.exports = router