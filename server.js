const express = require('express');
const app = express();

const auth = require('./auth.js');
const data = require('./data.js');
const authDB = new auth();
const dataDB = new data();

const spotify = require('./spotify.js');
const spotAPI = new spotify();

app.use(express.json());

app.use(express.static('public'));

function missing(res, label) {
    res.status(400);
    res.send({ error: `Missing required ${label}` });
}

const apiRouter = express.Router({ caseSensitive: true });
const authRouter = express.Router({ caseSensitive: true });

authRouter.use(async (req, res, next) => {
    let token = auth.parseAuth(req, 'Bearer');
    let user = await authDB.getUser(token);

    if(user) {
        req.user = user;
        req.token = token;
        next();
    }else {
        res.status(401);
        res.send({ msg: "Invaild auth token" });
    }
});

apiRouter.post('/user', async (req, res) => {
    let basic = auth.basicAuth(req, res);
    if(basic) {
        let [username, password] = basic;

        const token = await authDB.createUser(username, password);
        if(token === null) {
            res.status(403);
            res.send({ msg: 'Username taken' });
        }else {
            res.send({ token: token });
        }
    }else {
        missing(res, 'Basic Authorization');
    }
});

authRouter.delete('/user', (req, res) => {
    if(authDB.deleteUser(req.user)) {
        res.send({ msg: 'Success' });
    }else {
        res.status(400);
        res.send({ msg: 'Invalid user' });
    }
})

apiRouter.post('/login', async (req, res) => {
    let basic = auth.basicAuth(req, res);
    if(basic) {
        let [username, password] = basic;
        const authentic = await authDB.checkLogin(username, password);
        if(authentic) {
            let token = authDB.createToken(username);
            res.send({ token: token });
        }else {
            res.status(401);
            res.send({ msg: 'Unauthorized' });
        }
    }else {
        missing(res, 'Basic Authorization');
    }
});

authRouter.delete('/login', async (req, res) => {
    const exists = await authDB.isUser(req.user);

    if(exists) {
        authDB.deleteToken(req.token);
        res.send({ msg: 'Logged out' });
    }else {
        res.status(400);
        res.send({ msg: 'Invalid user' });
    }
});

apiRouter.get('/search/:query', (req, res) => {
    spotAPI.searchArtist(req.params.query).then((artists) => {
        if(artists) {
            res.send(artists);
        }else {
            res.send({ msg: 'Spotify query failed' });
            res.status(500);
        }
    });
});

authRouter.put('/artists', (req, res) => {
    const id = req.body.artistId;
    if(!id) {
        missing(res, 'artistId');
        return;
    }

    const user = req.user;
    if(!authDB.isUser(user)) {
        res.status(401);
        res.send({ error: 'Unauthorized' });
        return;
    }

    spotAPI.getAlbums(id).then((albums) => {
        if(!albums)
            throw new Error('Invalid artistId');

        spotAPI.getArtist(id).then((artist) => {
            if(!albums)
                throw new Error('Invalid artistId');

            dataDB.addArtist(id, artist.name, albums);
            dataDB.subscribe(user, id);
            res.send({ success: true });
        })
    }).catch((err) => {
        res.status(400);
        res.send({ error: 'Invalid artistId' });
    });
});

authRouter.get('/artists', (req, res) => {
    const artists = dataDB.listArtists(req.user);
    if(artists && artists.length) {
        res.send(artists);
    }else {
        res.status(204)
        res.end();
    }
});

authRouter.delete('/artists', (req, res) => {
    const id = req.body.artistId;
    if(!id) {
        missing('artistId');
        return;
    }

    const user = req.user;
    if(!authDB.isUser(user)) {
        res.status(401);
        res.send({ error: 'Unauthorized' });
        return;
    }

    if(dataDB.unsubscribe(user, id)) {
        res.send({ success: true });
    }else {
        res.send({ success: false });
    }
});

authRouter.get('/albums', (req, res) => {
    const albums = dataDB.listAlbums(req.user);
    if(albums && albums.length) {
        res.send(albums);
    }else {
        res.status(204)
        res.end();
    }
});

authRouter.put('/albums', (req, res) => {
    const id = req.body.albumId;
    const status = req.body.status;
    const user = req.user;

    if(!id) {
        missing(res, 'albumId');
        return;
    }else if(!status) {
        missing(res, 'status');
    }else if(!authDB.isUser(user)) {
        res.status(401);
        res.send({ error: 'Unauthorized' });
    }else if(!dataDB.hasStatus(user, id)) {
        res.status(400);
        res.send({ error: 'Specified albumId does not exist' });
    }else if(!dataDB.setStatus(user, id, status)) {
        res.status(400);
        res.send({ error: 'Invalid status' });
    }else {
        res.send({ success: true});
    }
});

app.use('/api', apiRouter);
app.use('/api', authRouter);

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

module.exports = app;
