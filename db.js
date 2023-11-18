const { MongoClient, ServerApiVersion } = require('mongodb');

const conf = require('./auth/mongoDB.json');
const url = `mongodb+srv://${conf.username}:${conf.password}@${conf.hostname}/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = client.db('spotcheck');
const users = db.collection('users');
const tokens = db.collection('tokens');

//const artists = db.collection('artists');
//const subs = db.collection('subs');
//const stats = db.collection('status');

// Test that you can connect to the database
(async function testConnection() {
    await client.connect();
    await db.command({ ping: 1 });

    doConfig(db);
})().catch((ex) => {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    client.close();
    process.exit(1);
});

async function doConfig(db) {
    const collections = await db.listCollections().toArray();
    if(!collections.some((col) => col.name === 'tokens')) {
        await db.createCollection('tokens');
    }
    const indices = await tokens.listIndexes().toArray();

    if(!indices.some((ind) => ind.name === 'expire')) {
        tokens.createIndex({ createdAt: 1 }, {
            name: 'expire',
            expireAfterSeconds: 3600 //1 hour
        });
    }
}

function addToken(token, username) {
    tokens.insertOne({ _id: token, user: username });
}

function deleteToken(token) {
    tokens.deleteOne({ _id: token });
}

async function getUser(token) {
    const userToken = await tokens.findOne({ _id: token });

    if(userToken) {
        return userToken.user;
    }

    return null;
}

async function addUser(username, hash) {
    const exists = await isUser(username);
    if(!exists) {
        users.insertOne({ _id: username, hash: hash });
        return true;
    }

    return false;
}

function deleteUser(username) {
    users.deleteOne({_id: username, hash: hash});
    tokens.deleteMany({ user: username });
    subs.deleteMany({ user: username });
    stats.deleteMany({ user: username });
}

async function isUser(username) {
    const user = await users.findOne({ _id: username });
    return user !== null;
}

async function getHash(username) {
    const user = await users.findOne({ _id: username });
    if(user)
        return user.hash;

    return null;
}

module.exports = {
    getHash, isUser, deleteUser, addUser,
    getUser, addToken, deleteToken
};

