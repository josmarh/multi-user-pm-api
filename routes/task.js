const express = require('express')
const authenticateToken = require('../middlewares/authenticateToken')
const TaskController = require('../controllers/taskController')

const router = express.Router()

router.get('/:pId', authenticateToken, TaskController.index)
router.post('/:pId/store', authenticateToken, TaskController.store)
router.get('/:pId/show/:id', authenticateToken, TaskController.show)
router.put('/:pId/update/:id', authenticateToken, TaskController.update)
router.delete('/:pId/delete/:id', authenticateToken, TaskController.destroy)
router.post('/:pId/assign/:taskId', authenticateToken, TaskController.assign_task)
router.post('/:pId/unassign/:taskId', authenticateToken, TaskController.unassign_task)

module.exports = router