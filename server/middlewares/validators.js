const { body } = require('express-validator')

const registerValidation = [
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('displayName').trim().notEmpty().withMessage('Display name is required').isLength({ max: 30 }).withMessage('Display name too long')
]

const loginValidation = [
    body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
]

const updateDataValidation = [
    body('userId').custom((value, { req }) => {
        if (value !== req.user.id) {
            throw new Error('Unauthorized: User ID mismatch');
        }
        return true;
    }),
    body('folders').isArray().withMessage('Folders must be an array'),
    body('folders.*.notes').isArray().withMessage('Note lists within folders must be arrays'),
    body('folders.*.notes.*.content').optional().isLength({ max: 50000 }).withMessage('Note content too long (max 50,000 characters)')
]

module.exports = {
    registerValidation,
    loginValidation,
    updateDataValidation
}