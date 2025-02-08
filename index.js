//get .env variables
require("dotenv").config()
const cors = require("cors")
const express = require("express")
const cookieParser = require("cookie-parser")
const workoutRoutes = require("./routes/workouts")
const userRoutes = require("./routes/users")

// initialize app
const app = express()
//set port
const PORT = process.env.PORT

//middleware
    //enable json in requests body
    app.use(express.json())

    app.use(cookieParser())

    // allow cors. the options allow cookies from/to all origins
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true
    }))

    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, PATCH, HEAD, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        next();
      })
    
    app.use((req, res, next) => {
        console.log(req.method, req.path)
        next()
    })

    app.get("/", (req, res) => res.send("tEST"))

    //routes
    app.use('/api/user', userRoutes)
    app.use('/api/workouts', workoutRoutes)

//start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

module.exports = app