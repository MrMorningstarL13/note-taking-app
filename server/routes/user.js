const express = require('express')
const router = express.Router();
const { getUsers, getByEmail } = require("../controllers/user")

router.get('/getAll', getUsers)
router.get('/getByEmail', getByEmail)

module.exports = router