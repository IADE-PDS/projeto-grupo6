const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();
const saltRounds = 10; 

class Child {
    /*chid MOdel:
    ip:
    n_of unity instances:
    */

    static async RegisterChild(user) {
        try {
            //recieve ping, master password
            //verify is pass is correct
            //register slave
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async CreateServer(user) {
        try {
            //recieve unity_server collection from the unity server
            //call unityServer here to create
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
}

module.exports = Child;