const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = require('./Project')
const User = require('./User')
const TaskAssignment = require('./TaskAssignment')

const Task = sequelize.define('ProjectTask', {
    project_id: { type: DataTypes.BIGINT, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false }, // (todo, in-progress, done)
    priority: { type: DataTypes.STRING, allowNull: false },
    due_date: { type: DataTypes.DATE, allowNull: false },
    created_by: { type: DataTypes.BIGINT, allowNull: false },
},{
    tableName: 'project_tasks',
    underscored: true, 
    timestamps: true,
    paranoid: true, // Enables soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

Task.belongsTo(Project, { foreignKey: 'project_id'});
Task.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy'});
Task.hasMany(TaskAssignment, { foreignKey: 'user_id', as: 'assignees'});

module.exports = Task;