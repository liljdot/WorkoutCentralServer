const Workout = require("../models/workoutModel")
require("dotenv").config()

const DB_URL = process.env.DB_URL

//GET REQUESTS
        //GET all workouts
        module.exports.getWorkouts = (req, res) => {
            if (req.error) {
                return res.status(req.error.status).json({status: req.error.status, message: req.error.message})
            }
            
            if (!req.user) {
                return res.status(401).json({status: 401, message: "You must be logged in to view workouts"})
            }

            fetch(DB_URL + `/workouts?userId=${req.user.id}`)
            .then(response => !response.ok ? (() => {throw new Error(response)})() : response.json())
            .then(workouts => res.status(200).json(workouts))
            .catch(e => res.status(400).json({status: 400, message: e.message}))
        }

        //GET single workout
        module.exports.getSingleWorkout = (req, res) => {
            if (req.error) {
                return res.status(req.error.status).json({status: req.error.status, message: req.error.message})
            }

            if (!req.user) {
                return res.status(401).json({status: 401, message: "You must be logged in to view workouts"})
            }

            const { id } = req.params
            fetch(DB_URL + `/workouts/${id}`)
            .then(response => !response.ok ? (() => {throw new Error("cannot find item")})() : response.json())
            .then(workout => workout.userId != req.user.id ? res.status(401).json({status: 401, message: "You are not authorized to view this workout"}) : res.status(200).json(workout))
            .catch(e => res.status(400).json({status: 400, message: e.message}))
        }

//POST REQUESTS
        //POST new workout
        module.exports.postWorkout = (req, res) => {
            const {title, load, reps, userId} = req.body
            const workout = new Workout(title, reps, load, userId)

            if (!title || isNaN(load) || isNaN(reps)) {
                return res.status(400).json({status: 400, message: "required fields not filled"})
            }

            if (req.error) {
                return res.status(req.error.status).json({status: req.error.status, message: req.error.message})
            }
            
            if (!userId || !req.user) {
                return res.status(401).json({status: 401, message: "You must be logged in to do that"})
            }
            
            if (req.user.id != userId) {
                res.status(401).json({status: 401, message: "You are not authorized to do that"})
            }

            fetch(DB_URL + "/workouts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                    body: JSON.stringify(workout)
            })
                .then(response => !response.ok ? (() => {throw new Error(response)})() : res.status(200).json(workout))
                .catch(e => res.status(400).json({status: 400, message: e.message}))
              
        }

//DELETE REQUESTS
        //DELETE a workout
        module.exports.deleteWorkout = (req, res) => {
            if (req.error) {
                return res.status(req.error.status).json({status: req.error.status, message: req.error.message})
            }

            if (!req.user) {
                return res.status(401).json({status: 401, message: "You must be logged in to delete workout"})
            }

            const { id } = req.params
            
            fetch(DB_URL + `/workouts?id=${id}&userId=${req.user.id}`)
            .then(response => !response.ok ? (() => {throw new Error("Database Error")})() : response.json())
            .then(([workout]) => !workout ? (() => {throw new Error("item not found")})() : workout.id)
            .then(id => fetch(DB_URL + "/workouts/" + id, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            }))
            .then(response => !response.ok ? (() => {throw new Error("item could not be deleted")})() : res.status(201).json({status: 201, message: "workout successfully deleted"}))
            .catch(e => res.status(400).json({status: 400, message: e.message}))
        }

//PUT/PATCH REQUESTS
        //update a workout
        module.exports.updateWorkout = (req, res) => {
            const { id } = req.params
            const { title, reps, load } = req.body

            if (!title || isNaN(load) || isNaN(reps)) {
                res.status(400).json({status: 400, message: "required fields not filled"})
                return
            }

            if (req.error) {
                return res.status(req.error.status).json({status: req.error.status, message: req.error.message})
            }

            if (!req.user) {
                return res.status(401).json({status: 401, message: "You must be logged in to edit workout"})
            }

            fetch(DB_URL + `/workouts?id=${id}&userId=${req.user.id}`)
            .then(response => !response.ok ? (() => {throw new Error("Database error")})() : response.json())
            .then(([workout]) => !workout ? (() => {throw new Error("item not found")})() : workout)
            .then(workout => fetch(DB_URL + "/workouts/" + workout.id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    updatedAt:  new Date().toISOString(),
                    title,
                    reps,
                    load,
                })
            }))
            .then(response => !response.ok ? (() => {throw new Error("could not update item")})() : res.status(200).json({status: 200, message: "workout updated successfully"}))
            .catch(e => res.status(400).json({status: 400, message: e.message}))
        } 