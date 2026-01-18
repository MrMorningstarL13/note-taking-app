const { getAll, findByEmail } = require('../models/user');

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

module.exports = {
    getUsers,
    getByEmail
}