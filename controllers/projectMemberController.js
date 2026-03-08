const { body } = require('express-validator');
const validate = require('../utils/validator');
const Project = require('../models/Project');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');

exports.index = async (req, res) => {
    const projectId = req.params.id

    const proMembers = await ProjectMember.findAll({
        where: { project_id: projectId }
    })

    res.json({ data: proMembers })
}

exports.add_member = [
    validate([
        body('role').notEmpty().isIn(['admin','member']),
        body('userId').notEmpty()
            .custom(async (value, { req }) => {
                const checkMemberExist = await ProjectMember.findOne({ 
                    where: { user_id: value, project_id: req.params.projectId }
                })
                if(checkMemberExist) throw new Error('User already added to project')

                const user = await User.findOne({ where: { id: value } });
                if (!user) throw new Error('User is not registered');
            }),
    ]),
    async (req, res) => {
        const projectId = req.params.projectId
        const {userId, role} = req.body
        let errors = []

        const project = await Project.findOne({ where: { id: projectId } })
        if(!project) errors.push('Project resource not found' )

        if(errors.length) {
            return res.status(422).json({ errors: errors })
        }

        const member = await ProjectMember.create({
            project_id: projectId,
            user_id: userId,
            role
        })

        res.status(201).json({
            message: 'Member added successfully',
            data: member
        })
    }
]

exports.remove_member = async (req, res) => {
    const projectId = req.params.projectId
    const memberId = req.params.memberId

    const pmember = await ProjectMember.findOne({ 
        where: { project_id: projectId, user_id: memberId },
    });
    if (!pmember) return res.status(422).json({message: 'Member is not associated with this project'})
    
    // check if the member is assigned any task to set it to unassigned
    
    pmember.destroy()

    res.status(200).json({
        message: 'Member removed succesfully!',
        data: pmember
    })
}