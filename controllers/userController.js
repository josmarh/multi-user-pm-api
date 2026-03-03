const { body } = require('express-validator');
const validate = require('../utils/validator');
const User = require('../models/User');

exports.index = async (req, res) => {
    const users = await User.findAll({ 
        limit: 10, 
        attributes: ['id', 'name', 'email', 'created_at']
    });

    res.json({ data: users })
}

exports.store = [
    validate([
        body('name').isLength({ min: 3 }),
        body('email')
            .isEmail()
            .custom(async (value) => {
                const user = await User.findOne({ where: { email: value } });
                if (user) throw new Error('E-mail already in use');
            }),
        body('password').isLength({ min: 6 }),
        body('passwordConfirmation').custom((value, { req }) => {
            if(!value) throw new Error("Password Confirmation is required");
            if (value !== req.body.password) throw new Error('Passwords do not match');
            return true;
        })
    ]), 
    async (req, res) => {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });

        const userData = user.toJSON();
        delete userData.password;
        delete userData.refresh_token;

        res.status(201).json({
            message: 'User created successful',
            data: userData
        })
    }
]