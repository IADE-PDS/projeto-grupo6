const auth = require("../config/utils");
const saltRounds = 10; 


class User {
    constructor(username, password,email , token) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.token = token;
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