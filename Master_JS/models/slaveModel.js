const bcrypt = require('bcrypt');
const db = require("../config/database");
const client = db.getdatabase();
const password = process.env.REGISTATION_PASSWORD 

class Slave {
    constructor(ip, n_unityServers){
        this.ip = ip;
    }

    static async RegisterChild(child) {
        try {
            if(child.pass != password || !child.pass)
                return {status: 401, result: {msg:"Not a valid server"}}
            let insert_child = new Slave();
            insert_child.ip = child.ip;
            let db = client.collection("slave");
            let dbResult = await db.insertOne(insert_child);
            //register slave
            return{status: 200, result: {msg:"Registered sucsessfully"}}
        } catch (err) {
            console.log(err);
            return {status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async CreateServer(settings) {
        try {
            let database = client.collection("slave");
            let slave = database.find().toArray;
            console.log(slave);

            //chooses from the database a slave to create the server on.(on this request also ask for the count of servers open, on each slave, and choose the one with the less)
            //should find a slave with the less servers
            //sends an http request to the slave to create the slave
            //if successfull send back the ip and port opened
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
}

module.exports = Slave;