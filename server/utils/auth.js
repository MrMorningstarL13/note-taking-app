const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function hashPassword( password ) {
    const salt = await bcrypt.genSalt(13);
    return bcrypt.hash( password, salt );
}

async function comparePassword( plainPassword, hashedPassword ) {
    return await bcrypt.compare( plainPassword, hashedPassword )
}

function generateToken( user ) {
    const userData = {
        id: user.id,
        email: user.email,
        displayName: user.displayName
    }

    return jwt.sign( userData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN } )
}

function verifyToken( token ) {
    try {
        return jwt.verify( token, process.env.JWT_SECRET )
    } catch (error) {
        console.log(error)
        return null
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
}