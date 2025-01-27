require("dotenv").config()
const jwt = require("jsonwebtoken")

const { SECRET_STRING, DB_URL } = process.env

module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.workout_central_user_token
    console.log(token)

    if (!token) {
        req.error = { status: 401, message: "User is not logged in" }
        next()
        return
    }

    jwt.verify(token, SECRET_STRING, (error, decodedToken) => {
        if (error) {
            console.log(error.message)
            req.error = { status: 401, message: error.message }
            next()
            return
        }

        fetch(DB_URL + `/users/${decodedToken.id}`)
            .then(response => !response.ok ? req.error = { status: 400, message: "Database error" } : response.json())
            .then(user => !user ? req.error = { status: 404, message: "User not found" } : req.user = { id: user.id, email: user.email })
            .catch(e => req.error = { status: 400, message: e.message })
            .finally(next)
    })
}