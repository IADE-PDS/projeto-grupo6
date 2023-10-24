const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();
const saltRounds = 10; 


class User {
    constructor(id, name, pass, token) {
        this.id = id;
        this.name = name;
        this.pass = pass;
        this.token = token;
    }
    export() {
        let user=new User();
        user.name = this.name;
        return user; 
    }

    static async getAll() {
        try {
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }  
    }

}

module.exports = User;