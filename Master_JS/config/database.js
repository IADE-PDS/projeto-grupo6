const { MongoClient } = require("mongodb");

const uri = process.env.ATLAS_URI;
const poolSize = 10;

const client = new MongoClient(uri, {
  maxPoolSize: poolSize 
});
const init = async () => {
  try {
    await client.connect();
    console.log("Connected");
  } catch (error) {
    console.log(error);
  }
};
const getdatabase = () => {
  let database = client.db(process.env.DATABASE_NAME)
  return database;
};
module.exports.init = init;
module.exports.getdatabase = getdatabase;