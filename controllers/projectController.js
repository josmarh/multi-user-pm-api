const { body } = require('express-validator');
const validate = require('../utils/validator');
const Project = require('../models/Project');
const User = require('../models/User');

exports.index = async (req, res) => {
    const userid = req.user.id
    const projects = await Project.findAll({ 
        where: { owner_id: userid }, 
        limit: 10,
        include: { model: User, attributes: ['id', 'name', 'email', 'created_at'] },
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
        let status = req.body.status || 'draft'

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
        include: { model: User, attributes: ['id', 'name', 'email', 'created_at'] },
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
    const project = await Project.findOne({ 
        where: { id: req.params.id },
    });
    if (!project) return res.status(404).json({message: 'Project not found'})
    
    project.destroy()

    res.status(200).json({
        message: 'Project deleted succesfully!',
        data: project
    })
}