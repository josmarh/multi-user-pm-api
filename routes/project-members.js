const express = require('express')
const ProjectMemberController = require('../controllers/projectMemberController')
const authenticateToken = require('../middlewares/authenticateToken')

const router = express.Router()

router.get('/:projectId/members', authenticateToken, ProjectMemberController.index)

router.post('/:projectId/member', authenticateToken, ProjectMemberController.add_member)

router.delete('/:projectId/member/:memberId', authenticateToken, ProjectMemberController.remove_member)


module.exports = router