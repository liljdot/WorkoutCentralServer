module.exports = class {
    constructor(title, reps, load, userId) {
        this.title = title,
        this.reps = reps,
        this.load = load,
        this.id = Date.now().toString(),
        this.createdAt = new Date().toISOString(),
        this.updatedAt = new Date().toISOString(),
        this.userId = userId
    }
}