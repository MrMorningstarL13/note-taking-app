const express = require('express')
const router = express.Router();
const { getUsers, getByEmail, login } = require("../controllers/user")

router.get('/getAll', getUsers)
router.get('/getByEmail', getByEmail)
router.post('/login', login)

module.exports = router