const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();
const saltRounds = 10; 

function isValidEmail(email) {
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

class User {
    constructor(username, password,email , token) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.token = token;
    }
    export() {
        let user=new User();
        user.name = this.name;
        return user; 
    }

    static async Register(user) {
        try {
            let db = client.collection("user")
            //* creating the other tables
            //*tabela de stats
            //* tabela de items
            //missing email verification
            if(!user.username || !user.email || !user.password)
                return {status: 422,result: {
                    msg:"Bad Data"
                }}
            if(!isValidEmail(user.email)){
                return {status: 422,result: {
                    msg:"Bad Data"
                }}
            }
            let dbResult = await db.find({ email: user.email}).toArray();
            if(dbResult.length){
                return {status: 400, result: {
                    msg:"That email is already registered"
                }}
            };
            let encpass = await bcrypt.hash(user.password, saltRounds);
            let insert_user = new User();
            insert_user.username = user.username;
            insert_user.password = encpass;
            insert_user.email = user.email;
            dbResult = await db.insertOne(insert_user);
            let user_id = dbResult.insertedId;
            console.log(user_id);

            db = client.collection("player_stats");
            //get from dbResult player id
            //insert a player stats basic format
            db = client.collection("player_items");
            let items = {"player_id":user_id,
                            "items":[]};
            dbResult = await db.insertOne(items);
            return {status: 200, result: {
                msg:"User Registered"
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async Login(user){
        try {
            let db = client.collection("user");
            //missing TFA
            if(!user.email || !user.password)
                return {status: 422,result: {
                    msg:"Bad Data"
                }}
            if(!isValidEmail(user.email)){
                return {status: 422,result: {
                    msg:"Bad Data"
                }}
            }
            let dbResult = await db.find({ email: user.email}).toArray();
            if(!dbResult.length)
                return {status: 401, result: {
                    msg:"Email or password incorrect"
                }}
           
            let dbUser = dbResult[0];
            let isPass = await bcrypt.compare(user.password, dbUser.password);
            if(!isPass)
                return {status: 401, result: {
                    msg:"Email or password incorrect"
                }}
            return {status: 200, result: {
                user:{
                    email: user.email
                },
                msg:"Loged in successfully"
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async SaveToken(user){
        try{
            console.log("saving token");
            let db = client.collection("user");
            let query = {email : user.email};
            let new_value = {$set:{token : user.token}}
            let dbResult = await db.updateOne(query, new_value);
            return { status: 200, result: {msg:"Token saved!"}};
        }catch(err){
            console.log(err);
            return{status: 500, result: { msg: "Internal server error" }}
        }
    }

}

module.exports = User;