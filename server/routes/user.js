const express = require('express')
const router = express.Router();
const { getByEmail, login, register, updateUserData, getById } = require("../controllers/user")
const { checkAuth } = require("../middlewares/authCheck")
const { loginValidation, registerValidation, updateDataValidation } = require("../middlewares/validators")

router.post('/login', loginValidation, login)
router.post('/register', registerValidation, register)
router.patch('/updateData', [checkAuth, ...updateDataValidation], updateUserData)

router.get('/getByEmail', checkAuth, getByEmail)
router.get('/:id', checkAuth, getById)

module.exports = router