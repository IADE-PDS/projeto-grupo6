const bcrypt = require('bcrypt');
const db = require("../config/database");
const client = db.getdatabase();
const password = process.env.REGISTATION_PASSWORD 

class Child {
    constructor(ip, n_unityServers){
        this.ip = ip;
        this.n_unityServers = n_unityServers;
    }

    static async RegisterChild(child) {
        try {
            if(child.pass != password)
                return {status: 401, result: {msg:"Not a valid server"}}
            
            let db = client.collection("child");
            
            //recieve ping, master password
            //verify is pass is correct
            //register slave
            return{status: 200, result: {msg:"Registered sucsessfully"}}
        } catch (err) {
            console.log(err);
            return {status: 500, result: { msg: "Internal server error" }};
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