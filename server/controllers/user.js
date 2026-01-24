const { getAll, findByEmail, create, update } = require('../models/user');
const { comparePassword, generateToken, hashPassword } = require("../utils/auth")

const getUsers = async (req, res) => {
    try {
        const users = await getAll();

        if (!users) {
            return res.status(404).json("No users found");
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json('Internal Server Error');
    }
}

const getByEmail = async (req, res) => {
    try {
        const { email } = req.body

        const searchedUser = await findByEmail(email)

        if (!searchedUser)
            return res.status(404).json("No user found for specified email!")

        return res.status(200).json(searchedUser)

    } catch (error) {
        console.error('Error fetching user by email:', error.message);
        res.status(500).json('Internal Server Error');
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json("You must provide a valid email and password")

        const user = await findByEmail(email)

        if (!user)
            return res.status(404).json("No user found for specified email address")

        const passwordCheck = await comparePassword(password, user.password)

        if (!passwordCheck)
            return res.status(401).json("Wrong password for specified email address")

        const token = generateToken(user)

        res.status(200).json({
            message: "Login successful",
            token,
            user
        })

    } catch (error) {
        console.error("Login error", error.message)
        return res.status(500).json("Internal server error")
    }
}

const register = async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        if (!email || !password || !displayName)
            return res.status(400).json("You must provide email, password, and display name")

        const existingUser = await findByEmail(email)

        if (existingUser)
            return res.status(409).json("A user with this email already exists")

        const hashedPassword = await hashPassword(password)

        const newUser = await create({
            email,
            password: hashedPassword,
            displayName,
            createdAt: new Date(),
            lastSync: new Date(),
            folders: [
                {
                    name: "unfoldered",
                    createdAt: new Date(),
                    notes: []
                },
                {
                    name: "favorites",
                    createdAt: new Date(),
                    notes: []
                }
            ]
        })

        const token = generateToken(newUser)

        res.status(201).json({
            message: "Registration successful",
            token,
            newUser
        })

    } catch (error) {
        console.error("Registration error", error.message)
        return res.status(500).json("Internal server error")
    }
}

const createNote = async (req, res) => {
    try {
        const { userId, folderName } = req.body;

        if (!userId || !folderName)
            return res.status(400).json("You must provide userId, folderName, and title")

        const user = await findByEmail(userId);

        if (!user)
            return res.status(404).json("User not found")

        const folderIndex = user.folders.findIndex(f => f.name === folderName);

        if (folderIndex === -1)
            return res.status(404).json("Folder not found")

        const newNote = {
            title: "New Note",
            content: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            isPinned: false,
            tags: []
        };

        user.folders[folderIndex].notes.push(newNote);
        user.lastSync = new Date();

        const updatedUser = await update(user.id, { folders: user.folders, lastSync: user.lastSync });

        res.status(201).json({
            message: "Note created successfully",
            note: newNote,
            user: updatedUser
        })

    } catch (error) {
        console.error("Create note error", error.message)
        return res.status(500).json("Internal server error")
    }
}

const createFolder = async (req, res) => {
    try {
        const { userId, folderName } = req.body;

        if (!userId || !folderName)
            return res.status(400).json("You must provide userId and folderName")

        const user = await findByEmail(userId);

        if (!user)
            return res.status(404).json("User not found")

        const folderExists = user.folders.some(f => f.name === folderName);

        if (folderExists)
            return res.status(409).json("A folder with this name already exists")

        const newFolder = {
            name: folderName,
            createdAt: new Date(),
            notes: []
        };

        user.folders.push(newFolder);
        user.lastSync = new Date();

        const updatedUser = await update(user.id, { folders: user.folders, lastSync: user.lastSync });

        res.status(201).json({
            message: "Folder created successfully",
            folder: newFolder,
            user: updatedUser
        })

    } catch (error) {
        console.error("Create folder error", error.message)
        return res.status(500).json("Internal server error")
    }
}

module.exports = {
    getUsers,
    getByEmail,
    login,
    register,
    createNote,
    createFolder
}