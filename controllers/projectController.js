const { body } = require('express-validator');
const validate = require('../utils/validator');

const Project = require('../models/Project');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');

exports.index = async (req, res) => {
    const userid = req.user.id
    const projects = await Project.findAll({ 
        where: { owner_id: userid }, 
        limit: 10,
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

    res.status(200).json({data: projects})
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
    if (!project) return res.status(404).json({message: 'Project not found'})

    // enforce before user delete project must assign to a project member
    if(parseInt(project.owner_id) === req.user.id) {
        return res.status(422).json({error: {
            message: 'Kindly assign project owner to another user before deleting'
        }})
    }

    // delete cascade: project_members, tasks
    ProjectMember.findAll({ where: { project_id: projectId } }).destroy()

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