const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')
const ProjectMember = require('./ProjectMember')

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false }, // todo, in-progress, done, draft
},{
    underscored: true, 
    timestamps: true,
    paranoid: true, // Enables soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
        afterCreate: async (project) => {
            await ProjectMember.create({
                project_id: project.id,
                user_id: project.owner_id,
                role: 'admin'
            })
        }
    }
});

Project.belongsTo(User, {as: 'owner', foreignKey: 'owner_id' });
Project.hasMany(ProjectMember, {as: 'members', foreignKey: 'project_id'})

module.exports = Project;
