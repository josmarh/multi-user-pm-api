const { body } = require('express-validator');
const validate = require('../utils/validator');
const Project = require('../models/Project');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');

exports.index = async (req, res) => {
    const projectId = req.params.id

    const proMembers = ProjectMember.findAll({
        where: { project_id: projectId }
    })

    res.json({ data: proMembers })
}