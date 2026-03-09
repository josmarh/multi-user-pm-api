const { body } = require('express-validator');
const validate = require('../utils/validator');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination')

const Task = require('../models/Task')
const TaskAssignment = require('../models/TaskAssignment')
const Project = require('../models/Project')
const ProjectMember = require('../models/ProjectMember')
const User = require('../models/User')

exports.index = async (req, res) => {
    const { page, per_page } = req.query;
    const { limit, offset } = getPagination(page, per_page);

    const queryTitle = req.query.title
    let whereClause = {project_id: req.params.pId}

    if(queryTitle) {
        whereClause['title'] = {[Op.iLike]: `%${queryTitle}%`}
    }

    const tasks = await Task.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['id', 'DESC']],
    })

    const response = getPagingData(tasks, page, limit);
    res.json({ data: response })
}

exports.store = [
    validate([  
        body('project_id').notEmpty()
            .custom(async (value) => {
                const project = await Project.findOne({ where: { id: value }})
                if(!project) throw new Error('Project not found')
            }),
        body('title').notEmpty().isLength({ min: 3 }),
        body('description').notEmpty().isLength({ min: 6 }),
        body('status').notEmpty().isIn(['todo','in-progress','done']).withMessage('Invalid value for status'),
        body('priority').notEmpty().isString(),
        body('due_date').notEmpty().isDate()
    ]),
    async (req, res) => {
        const created_by = req.user.id
        const {project_id, title, description, status, priority, due_date} = req.body

        const task = await Task.create({
            project_id, title, description, status, priority, due_date, created_by: created_by
        })

        res.status(201).json({
            message: 'Task created successfully',
            data: task
        })
    }
]

exports.show = async (req, res) => {
    const task = await Task.findOne({
        where: {id: req.params.id},
        include: {
            model: User, attributes: ['id', 'name', 'email'], as: 'createdBy'
        }
    })
    if(!task) return res.status(422).json({error: {message: 'Task resource not found'}})

    return res.json({data: task})
}

exports.update = [
    validate([  
        body('title').notEmpty().isLength({ min: 3 }),
        body('description').notEmpty().isLength({ min: 6 }),
        body('status').notEmpty().isIn(['todo','in-progress','done']).withMessage('Invalid value for status'),
        body('priority').notEmpty().isString(),
    ]),
    async (req, res) => {
        const task = await Task.findOne({
            where: {id: req.params.id},
        })
        if(!task) return res.status(422).json({error: {message: 'Task resource not found'}})

        const {title, description, status, priority, due_date} = req.body
        task.update({
            title, description, status, priority, due_date
        })

        return res.json({
            message: 'Task updated successfully',
            data: task
        })
    }
]

exports.destroy = async (req, res) => {
    const task = await Task.findOne({
        where: {id: req.params.id},
    })
    if(!task) return res.status(422).json({error: {message: 'Task resource not found'}})

    // Delete task_assignments
    await TaskAssignment.findAll({ where: { task_id: task.id }}).destroy()

    task.destroy()

    return res.json({
        message: 'Task deleted successfully',
        data: task
    })
}

exports.assign_task = [
    validate([
        body('projectId').notEmpty().isNumeric(),
        body('userId').notEmpty().isNumeric(),
        body('assignedAt').notEmpty().isDate()
    ]),
    async (req, res) => {
        const taskId = req.params.taskId
        const {projectId, userId, assignedAt} = req.body

        const task = await Task.findOne({
            where: {id: taskId},
        })
        if(!task) return res.status(422).json({error: {message: 'Task resource not found'}})

        // Check user is a project member
        const isProjectMember = await ProjectMember.findOne({ 
            where: {project_id: projectId, user_id: userId }
        })
        if(!isProjectMember) return res.status(422).json({
            error: {message: 'User is not a member of this project'}
        })

        // Confirm task is not assign to same user twice
        const checkTaskAssign = await TaskAssignment.findOne({
            where: { task_id: taskId, user_id: userId }
        })
        if(checkTaskAssign) return res.status(422).json({
            error: {message: 'Task already assigned to this user'}
        })

        const taskAssign = await TaskAssignment.create({
            task_id: taskId,
            user_id: userId,
            assigned_at: assignedAt,
        })

        return res.status(201).json({
            message: 'Task assigned successfully',
            data: taskAssign
        })
    }
]

exports.unassign_task = [
    validate([
        body('userId').notEmpty().isNumeric(),
    ]),
    async (req, res) => {
        const taskId = req.params.taskId
        const userId = req.body.userId

        const task = await Task.findOne({
            where: {id: taskId},
        })
        if(!task) return res.status(422).json({error: {message: 'Task resource not found'}})

        const taskAssign = await TaskAssignment.findOne({
            where: {
                task_id: taskId,
                user_id: userId,
            }
        })
        taskAssign.destroy()

        return res.json({
            message: 'Task assigned successfully',
            data: taskAssign
        })
    }
]