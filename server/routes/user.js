const express = require('express')
const router = express.Router();
const { getUsers, getByEmail, login, register, createNote, createFolder } = require("../controllers/user")

router.get('/getAll', getUsers)
router.get('/getByEmail', getByEmail)
router.post('/login', login)
router.post('/register', register)
router.post('/createNote', createNote)
router.post('/createFolder', createFolder)

module.exports = router