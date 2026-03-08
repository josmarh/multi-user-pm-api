const { body } = require('express-validator');
const validate = require('../utils/validator');
const { getPagination, getPagingData } = require('../utils/pagination')
const { Op } = require('sequelize');

const User = require('../models/User');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task')
const TaskAssignment = require('../models/TaskAssignment')

exports.index = async (req, res) => {
    const { page, per_page } = req.query;
    const { limit, offset } = getPagination(page, per_page);

    const userid = req.user.id
    const projects = await Project.findAndCountAll({ 
        where: { owner_id: userid }, 
        limit,
        offset,
        order: [['id', 'DESC']],
        include: [
            { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
            { model: ProjectMember, as: 'members', attributes: ['id', 'role'],
                include: { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email'] 
                }
            }
        ]
    });

    const response = getPagingData(projects, page, limit);
    res.status(200).json({data: response})
}

exports.store = [
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('description').notEmpty().withMessage('Description is required'),
    ]),
    async (req, res) => {
        const {name, description} = req.body
        const userid = req.user.id
        let status = req.body?.status || 'draft'

        const project = await Project.create({ name, description, owner_id: userid, status: status });

        res.status(201).json({
            message: 'Project created successfully!',
            data: project
        })
    }
]

exports.show = async (req, res) => {
    const project = await Project.findOne({ 
        where: { id: req.params.id }, 
        include: [
            { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
            { model: ProjectMember, as: 'members', attributes: ['id', 'role'],
                include: { 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'name', 'email'] 
                }
            }
        ],
    });
    if (!project) return res.status(404).json({message: 'Project not available'})

    res.status(200).json({data: project})
}

exports.update = [
    validate([
        body('name').notEmpty().withMessage('Name is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('status').notEmpty().withMessage('Status is required'),
    ]),
    async (req, res) => {
        const project = await Project.findOne({ 
            where: { id: req.params.id },
        });
        if (!project) return res.status(404).json({message: 'Project not found'})

        const {name, description, status} = req.body
        project.update({ name, description, status })

        res.status(200).json({
            message: 'Project updated succesfully!',
            data: project
        })
    }
]

exports.destroy = async (req, res) => {
    const projectId = req.params.id

    const project = await Project.findOne({ 
        where: { id: projectId },
    });
    if (!project) return res.status(404).json({message: 'Project resource not found'})

    // enforce before user delete project must assign to a project member
    if(parseInt(project.owner_id) === req.user.id) {
        return res.status(422).json({error: {
            message: 'Kindly assign project owner to another user before deleting'
        }})
    }

    // delete FK related: project_members, tasks, task_assignments
    await ProjectMember.destroy({ where: { project_id: projectId } })

    const tasks = await Task.findAll({ where: { project_id: projectId } })

    if(tasks && tasks.length) {
        const taskIds = tasks.map(task => task.id);

        await TaskAssignment.destroy({ where: { task_id: {[Op.in]: taskIds }}})

        await Task.destroy({ where: { id: {[Op.in]: taskIds} }})
    }
    project.destroy()

    res.status(200).json({
        message: 'Project deleted succesfully!',
        data: project
    })
}

exports.update_project_owner = async (req, res) => {
    const id = req.params.id
    const memberId = req.params.memberId

    const project = await Project.findOne({ 
        where: { id: id, owner_id: req.user.id },
    });
    if (!project) return res.status(404).json({message: 'Project not found'})

    project.update({ owner_id: memberId })

    const promember = await ProjectMember.findOne({ where: { project_id: id, user_id: memberId } })
    if(promember) {
        promember.update({role: 'admin'})
    }else {
        const user = await User.findOne({ where: { id: memberId } });
        if (!user) throw new Error('User is not registered');

        await ProjectMember.create({
            project_id: id,
            user_id: memberId,
            role: 'admin'
        })
    }

    res.status(200).json({
        message: 'Project owner updated succesfully',
        data: project
    })
}