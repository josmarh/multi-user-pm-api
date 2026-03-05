const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = require('./Task')
const User = require('./User')

const TaskAssignment = sequelize.define('TaskAssignment', {
    task_id: { type: DataTypes.BIGINT, allowNull: false },
    user_id: { type: DataTypes.BIGINT, allowNull: true },
    assigned_at: { type: DataTypes.DATE, allowNull: true },
},{
    underscored: true,
    timestamps: true,
    paranoid: true, // Enables soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
});

// Relationship
// TaskAssignment.belongsTo(Task, { foreignKey: 'task_id' });
// TaskAssignment.belongsTo(User, { foreignKey: 'user_id' });
TaskAssignment.associate = (models) => {
    // Correct way: use models.Task
    TaskAssignment.belongsTo(models.Task, { 
        foreignKey: 'task_id', 
        as: 'task' 
    });

    // Consistent way: use models.User
    TaskAssignment.belongsTo(models.User, { 
        foreignKey: 'user_id', 
        as: 'user' 
    });
};

module.exports = TaskAssignment;