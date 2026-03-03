const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')
const ProjectMember = require('./ProjectMember')

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false }, // ongoing, draft, completed, pending
},{
    underscored: true, 
    timestamps: true,
    paranoid: true, // Enables soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
        afterCreate: async (project) => {
            new ProjectMember({
                project_id: project.id,
                user_id: project.owner_id,
                role: 'owner'
            })
        }
    }
});

Project.belongsTo(User, { foreignKey: 'owner_id' });
Project.hasMany(ProjectMember)

module.exports = Project;
