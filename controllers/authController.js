const { body, validationResult } = require('express-validator');
const validate = require('../utils/validator')
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const User = require('../models/User');

exports.register = [
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
            if (value !== req.body.password) throw new Error('Passwords do not match');
            return true;
        }).withMessage('passwords do not match')
    ]), 
    async (req, res) => {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });

        const userData = user.toJSON();
        delete userData.password;

        res.status(201).json({
            message: 'Registeration successful',
            data: userData
        })
    }
]

exports.login = [
    validate([
        body('email').isEmail(),
        body('password').notEmpty().withMessage('Password is required'),
    ]),
    async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(401).json({ message: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

            const userData = user.toJSON();
            delete userData.password;
            delete userData.refresh_token;

            const accessToken = generateAccessToken(userData)
            const refreshToken = jwt.sign(userData, process.env.JWT_REFRESH_TOKEN_SECRET)

            // Add to DB
            await user.update({ refresh_token: refreshToken });

            res.status(200).json({ 
                accessToken: accessToken,
                refreshToken: refreshToken
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
]

exports.refreshToken = [
    validate([
        body('token').notEmpty().withMessage('Token is required'),
    ]),
    async (req, res) => {
        const refreshToken = req.body.token

    }
]

exports.logout = [
    validate([
        body('token').notEmpty().withMessage('Token is required'),
    ]),
]

function generateAccessToken(user) {
    return jwt.sign(user, process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' })
}