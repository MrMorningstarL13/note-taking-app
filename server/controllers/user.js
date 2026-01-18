const { getAll, findByEmail } = require('../models/user');
const { comparePassword, generateToken } = require("../utils/auth")

const getUsers = async (req, res) => {
    try {
        const users = await getAll();

        if(!users) {
            return res.status(404).json("No users found");
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json('Internal Server Error');
    }
}

const getByEmail = async(req, res) => {
    try {
        const {email} = req.body

        const searchedUser = await findByEmail(email)

        if(!searchedUser)
            return res.status(404).json("No user found for specified email!")

        return res.status(200).json(searchedUser)

    } catch (error) {
        console.error('Error fetching user by email:', error.message);
        res.status(500).json('Internal Server Error');
    }
}

const login = async( req, res ) => {
    try {
        const { email, password } = req.body;

        if(!email || !password)
            return res.status(400).json("You must provide a valid email and password")

        const user = await findByEmail(email)

        if(!user)
            return res.status(404).json("No user found for specified email address")

        const passwordCheck = await comparePassword(password, user.password)

        if(!passwordCheck)
            return res.status(401).json("Wrong password for specified email address")

        const token = generateToken(user)

        res.status(200).json({
            message: "Login successful",
            token
        })

    } catch (error) {
        console.error("Login error", error.message)
        return res.status(500).json("Internal server error")
    }
}

module.exports = {
    getUsers,
    getByEmail,
    login
}