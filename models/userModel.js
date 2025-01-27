module.exports = class {
    constructor(email, password) {
        this.email = email,
        this.password = password,
        this.id = Date.now().toString()
    }
}