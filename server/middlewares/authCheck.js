const { verifyToken } = require("../utils/auth")

const checkAuth = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token)
        return res.status(401).json("Unauthorized")

    const decodedToken = verifyToken(token)

    if (!decodedToken)
        return res.status(401).json("Unauthorized")

    req.user = decodedToken
    next()
}

module.exports = {
    checkAuth
}