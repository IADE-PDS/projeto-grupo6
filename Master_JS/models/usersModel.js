const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const { ObjectId } = require('mongodb');
const client = db.getdatabase();
const saltRounds = 10; 

function isValidEmail(email) {
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

class User {
    constructor(id,username, password,email , token) {
        this.id = id
        this.username = username;
        this.email = email;
        this.password = password;
        this.token = token;
    }
    static async Register(user) {
        try {
            //verify if the user is in any game currently
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async Register(user) {
        try {
            let db = client.collection("user")
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
            insert_user.inventory = [];
            insert_user.stats = [];//! logica de minigame nas stats 

            dbResult = await db.insertOne(insert_user);
            let user_id = dbResult.insertedId;
            return {status: 200, result: {
                id: user_id,
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
                    id: dbUser._id,
                    username: dbUser.username
                },
                msg:"Logged in successfully"
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async SaveToken(user){
        try{
            let db = client.collection("user");
            let id = new ObjectId(user.id)
            console.log(user);
            let query = {_id : id};
            let new_value = {$set:{token : user.token}}
            let dbResult = await db.updateOne(query, new_value);
            console.log(user);
            return { status: 200, result: {msg:"Token saved!"}};
        }catch(err){
            console.log(err);
            return{status: 500, result: { msg: "Internal server error" }}
        }
    }
//id,username, password,email , token
    static async getUserByToken(token){
        try{
            let db = client.collection("user");
            let dbResult = await db.find({ token: token}).toArray();
            let user = new User(dbResult[0]._id.toString(), dbResult[0].username, dbResult[0].password, dbResult[0].email, dbResult[0].token);
            if(!user)
                return {status:404, results:{msg:"No User Found"}}
            return { status: 200, result: {user:user}};
        }catch(err){
            console.log(err);
            return{status: 500, result: { msg: "Internal server error" }}
        }
    }
}

module.exports = User;