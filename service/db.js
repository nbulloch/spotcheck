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

const artists = db.collection('artists');
const albums = db.collection('albums');
const subs = db.collection('subs');
const stats = db.collection('status');

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
    tokens.insertOne({ _id: token, user: username, createdAt: new Date() });
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

function addArtist(artist) {
    artists.findOne({ _id: artist._id }).then((stored) => {
        if(stored === null) {
            artists.insertOne(artist);
        }
    });
}

async function listArtists(user) {
    const userSubs = await subs.find({ user: user }).toArray();
    const list = userSubs.map(async (sub) => {
        const id = sub.artistId;
        const artist = await artists.findOne({ _id: id });

        const artistAlbums = await albums.find({ artistId: id }).toArray();
        const albumIds = artistAlbums.map((album) => {
            return { albumId: album._id };
        });

        let checked = [];
        if(albumIds.length != 0) {
            checked = await stats.find({
                user: user,
                $or: albumIds,
                status: 'Checked'
            }).toArray();
        }

        return {
            id: id,
            name: artist.name,
            checkedAlbums: checked.length,
            totalAlbums: artistAlbums.length
        };
    });

    return await Promise.all(list);
}

function updateArtist(artist) {
    artists.updateOne({ _id: artist._id }, { $set: artist });
}

async function deleteArtist(artistId) {
    artists.deleteOne({ _id: artistId });
    const artistAlbums = await albums.find({ artistId: artistId });
    artistAlbums.forEach((album) => {
        stats.deleteMany({ albumId: album._id });
    });

    albums.deleteMany({ artistId: artistId });
    subs.deleteMany({ artistId: artistId });
}

function allArtists() {
    return artists.find({}).toArray();
}

async function setAlbums(artistId, albumArray) {
    let storedAlbums = await albums.find({}).toArray();
    storedAlbums = storedAlbums.map((album) => album._id);

    //No updates: Assuming metadata never changes for an id
    const newAlbums = albumArray.filter((album) => !storedAlbums.includes(album._id));
    if(newAlbums.length > 0) {
        newAlbums.forEach((album) => {
            album.artistId = artistId;
            albums.insertOne(album)
        });

        const userSubs = await subs.find({ artistId: artistId }).toArray();
        userSubs.forEach((sub) => refreshSub(sub.user, newAlbums));
    }

    return newAlbums;
}

async function listAlbums(user) {
    const userStats = await stats.find({ user: user }).toArray();
    const list = userStats.map(async (stat) => {
        const albumId = stat.albumId;
        const status = stat.status;

        let artistName = 'Unknown';
        let albumName = 'Unknown';
        const album = await albums.findOne({ _id: albumId });
        if(album) {
            albumName = album.name;

            const artist = await artists.findOne({ _id: album.artistId });
            if(artist) {
                artistName = artist.name;
            }
        }

        return {
            id: albumId,
            artist: artistName,
            album: albumName,
            status: status
        };
    });

    return await Promise.all(list);
}

function refreshSub(user, albumArr) {
    albumArr.forEach(async (album) => {
        const stat = await stats.findOne({ user: user, albumId: album._id });
        if(stat === null) {
            stats.insertOne({
                user: user,
                albumId: album._id,
                status: "New Release"
            });
        }
    });
}

async function subscribe(user, artistId) {
    const sub = { user: user, artistId: artistId };
    const stored = await subs.findOne(sub);
    if(stored === null) {
        subs.insertOne(sub);
    }

    const artistAlbums = await albums.find({ artistId: artistId }).toArray();
    refreshSub(user, artistAlbums);
}

async function unsubscribe(user, artistId) {
    const artistAlbums = await albums.find({ artistId: artistId }).toArray();
    artistAlbums.forEach((album) => {
        stats.deleteMany({ albumId: album._id });
    });

    const resp = await subs.deleteOne({ user: user, artistId: artistId });
    return resp.deletedCount == 1;
}

async function hasStatus(user, albumId) {
    const stat = await stats.findOne({ user: user, albumId: albumId });

    return stat !== null;
}

function setStatus(user, albumId, status) {
    stats.updateOne(
        { user: user, albumId: albumId },
        { $set: { status: status } },
        { $upsert: true }
    );
}

module.exports = {
    addUser, getHash, deleteUser, isUser,
    addToken, getUser, deleteToken,

    addArtist, listArtists, updateArtist, deleteArtist, allArtists,
    setAlbums, listAlbums,

    subscribe, unsubscribe,
    setStatus, hasStatus
};

