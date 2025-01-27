const express = require('express')
const {login, logout, signup, getUser} = require('../controllers/userscontroller')
const { requireAuth } = require('../middleware/authMiddleware')

const userRoutes = express()

//get user route
userRoutes.get('/', requireAuth, getUser)

//login route
userRoutes.post('/login', login)

//signup route
userRoutes.post('/signup', signup)

//logout route
userRoutes.post('/logout', logout)

module.exports = userRoutes