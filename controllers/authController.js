const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const validate = require('../utils/validator')
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

            const accessToken = jwt.sign(userData, process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' })
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
        const user = await User.findOne({ where: { refresh_token: refreshToken } });
        if (!user) return res.status(403).json({message: 'Token forbidden'})

        jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, user) => {
            if(err) return res.status(403).json({message: err.toString()})
            
            const newUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            }
            const accessToken = jwt.sign(newUser, process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' })
            res.json({accessToken: accessToken})
        })
    }
]

exports.logout = async (req, res) => {
    try {
        const userId = req.user.id;

        await User.update(
            { refresh_token: null }, 
            { where: { id: userId } }
        );

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
}