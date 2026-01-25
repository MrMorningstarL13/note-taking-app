const express = require('express')
const router = express.Router();
const { getUsers, getByEmail, login, register, updateUserData, getById } = require("../controllers/user")

router.get('/getAll', getUsers)
router.get('/getByEmail', getByEmail)
router.get('/:id', getById)
router.post('/login', login)
router.post('/register', register)
router.patch('/updateData', updateUserData)

module.exports = router