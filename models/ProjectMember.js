const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')
const Project = require('./Project')

const ProjectMember = sequelize.define('ProjectMember', {
    project_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
},{
    underscored: true, 
    timestamps: true,
    paranoid: true, // Enables soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at', // Maps to column name
});

ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user'});

// Define Relationship
ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, { foreignKey: 'project_id'});
};

module.exports = ProjectMember;