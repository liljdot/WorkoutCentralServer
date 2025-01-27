const User = require('../models/userModel')
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
require("dotenv").config()
const validator = require('validator')

const { DB_URL, SECRET_STRING } = process.env

const checkUserExists = email => {
    return new Promise((resolve, reject) => {
        fetch(DB_URL + '/users')
            .then(response => response.ok ? response.json() : (() => { throw new Error('Server Error') })())
            .then(val => val.find(user => user.email == email))
            .then(user => resolve(user))
            .catch(e => reject(e))
    })
}

const hashNewPassword = password => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt()
            .then(salt => bcrypt.hash(password, salt))
            .then(hashedPassword => resolve(hashedPassword))
            .catch(e => reject(e))
    })
}

const createToken = (id) => {
    return jwt.sign({ id }, SECRET_STRING, {
        expiresIn: "1d"
    })
}

// get user route
module.exports.getUser = (req, res) => {
    const { user, error } = req

    if (error) {
        console.log(error)
        res.status(error.status).json({ status: error.status, message: error.message, data: { user: null } })
        return
    }

    res.status(200).json({ status: 200, message: "Get user request was successful", data: { user } })
}

//login user
module.exports.login = (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400).json({ status: 400, message: "Please fill all fields" })
        return
    }

    if (!validator.isEmail(email)) {
        res.status(400).json({ status: 400, message: "Please input valid email" })
        return
    }

    // user id for token creation later
    let userObj

    checkUserExists(email)
        .then(user => !user ? (() => { throw new Error("User with this email does not exist") })() : (() => {
            userObj = user
            return bcrypt.compare(password, user.password)
        })())
        .then(isCorrect => !isCorrect ? (() => { throw new Error("Incorrect Password") })() : createToken(userObj.id))
        .then(token => {
            res.cookie('workout_central_user_token', token, {
                maxAge: 86400000,
                httpOnly: true,
                sameSite: "None",
                secure: true
            })
            res.status(200).json({ status: 200, message: "login was successful", data: { token, user: { email: userObj.email, id: userObj.id } } })
        })
        .catch(e => res.status(400).json({ status: 400, message: e.message }))
}

//logout user
module.exports.logout = (req, res) => {
    res.cookie("workout_central_user_token", "", {
        maxAge: 1,
        httpOnly: true,
        sameSite: "None",
        secure: true
    })

    res.status(200).json({ status: 200, message: "logged out successfully" })
}

//signup user
module.exports.signup = (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400).json({ status: 400, message: "Please fill all fields" })
        return
    }

    if (!validator.isEmail(email)) {
        res.status(400).json({ status: 400, message: "Please input valid email" })
        return
    }

    if (!validator.isStrongPassword(password)) {
        res.status(400).json({ status: 400, message: "Password not strong enough" })
        return
    }

    // user id for token creation later
    let userId

    checkUserExists(email)
        .then(user => user ? (() => { throw new Error("User with this email already exists") })() : hashNewPassword(password))
        .then(hashedPassword => new User(email, hashedPassword))
        .then(newUser => {
            userId = newUser.id
            return fetch(DB_URL + "/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            })
        })
        .then(response => !response.ok ? (() => { throw new Error("server error") })() : (() => {
            const token = createToken(userId)
            res.cookie('workout_central_user_token', token, {
                maxAge: 86400000,
                httpOnly: true,
                sameSite: "None",
                secure: true
            })
            res.status(200).json({ status: 200, message: "User created successfully", data: { token } })
        })())
        .catch(e => res.status(400).json({ status: 400, message: e.message }))
}