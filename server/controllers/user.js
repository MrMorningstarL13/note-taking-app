const { findByEmail, findById, create, update } = require('../models/user');
const { comparePassword, generateToken, hashPassword } = require("../utils/auth")

const { validationResult } = require('express-validator');

const updateUserData = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { userId, folders } = req.body;

        if (!userId)
            return res.status(400).json("User ID is required");

        if (!folders || !Array.isArray(folders))
            return res.status(400).json("Folders array is required");

        const user = await findById(userId);

        if (!user)
            return res.status(404).json("User not found");

        const updatedUser = await update(userId, {
            folders,
            lastSync: new Date()
        });

        res.status(200).json({
            message: "User data updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update user data error", error.message);
        return res.status(500).json("Internal server error");
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

const getById = async (req, res) => {
    try {
        const { id } = req.params
        const searchedUser = await findById(id)

        if (!searchedUser)
            return res.status(404).json("No user found for specified ID!")

        return res.status(200).json(searchedUser)

    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json('Internal Server Error');
    }
}

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json("You must provide a valid email and password")

        const user = await findByEmail(email)
        console.log(user)

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
                    name: "All notes",
                    id: "all notes",
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

module.exports = {
    getByEmail,
    login,
    register,
    updateUserData,
    getById
}