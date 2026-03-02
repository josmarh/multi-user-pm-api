const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    owner_id: { type: DataTypes.BIGINT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false }, // ongoing, draft, completed, pending
    // deleted_at: { type: DataTypes.DATE, allowNull: true }
},{
    underscored: true, 
    timestamps: true,
    paranoid: true, // Enables soft deletes
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at' // Maps to column name
});

Project.belongsTo(User, {
    foreignKey: 'owner_id',
});

module.exports = Project;
