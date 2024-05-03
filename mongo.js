const {MongoClient, ObjectId} = require('mongodb');

const dbUrl = "mongodb+srv://lucianostani97:43yA6FlT91dXUU2b@ecommerce.my22liv.mongodb.net/";
const dbName = "google-auth";

let _db = null;

async function connect(){
    if(!_db){
        const connectionString = dbUrl;
        const dbN = dbName;
        const client = await MongoClient.connect(connectionString);
        _db = client.db(dbN);
    }
    return _db;
}

async function createUser(user){
    const db = await connect();
    const result = await db.collection('User').insertOne(user)
    return result
}

async function getUserById(id){
    const db = await connect();
    const result = await db.collection('User').findOne({id:id})
    return result
}

module.exports = {createUser, getUserById}