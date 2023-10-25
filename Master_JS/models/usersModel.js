const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase().collection("User");
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
            //missing email verification
            if(!user.username || !user.email || !user.password)
                return {status: 422,result: {
                    msg:"Email and password required"
                }}
            if(!isValidEmail(user.email)){
                return {status: 422,result: {
                    msg:"Email and password required"
                }}
            }
            let dbResult = await client.find({ email: user.email}).toArray();
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
            dbResult = await client.insertOne(insert_user);
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
            //missing TFA
            if(!user.email || !user.password)
                return {status: 422,result: {
                    msg:"Email and password required"
                }}
            if(!isValidEmail(user.email)){
                return {status: 422,result: {
                    msg:"Email and password required"
                }}
            }
            let dbResult = await client.find({ email: user.email}).toArray();
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
            let query = {email : user.email}
            let new_value = {$set:{token : user.token}}
            let dbResult = await client.updateOne(query, new_value);
            return { status: 200, result: {msg:"Token saved!"}} ;
        }catch(err){
            console.log(err);
            return{status: 500, result: { msg: "Internal server error" }}
        }
    }

}

module.exports = User;