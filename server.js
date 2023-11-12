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

const apiRouter = express.Router({ caseSensitive: true });
const authRouter = express.Router({ caseSensitive: true });

authRouter.use((req, res, next) => {
    let token = auth.parseAuth(req, 'Bearer');
    let user = authDB.getUser(token);

    if(user) {
        req.user = user;
        req.token = token;
        next();
    }else {
        res.status(401);
        res.send({ msg: "Invaild auth token" });
    }
});

apiRouter.post('/user', (req, res) => {
    let basic = auth.basicAuth(req, res);
    if(basic) {
        let [username, password] = basic;

        if(authDB.isUser(username)) {
            res.status(403);
            res.send({ msg: 'Username taken' });
        }else {
            let token = authDB.createUser(username, password);

            res.send({ token: token });
        }
    }else {
        res.status(400);
        res.send({ msg: 'Basic authorization required' });
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

apiRouter.post('/login', (req, res) => {
    let basic = auth.basicAuth(req, res);
    if(basic) {
        let [username, password] = basic;
    if(authDB.checkLogin(username, password)) {
            let token = authDB.createToken(username);

            res.send({ token: token });
        }else {
            res.status(401);
            res.send({ msg: 'Unauthorized' });
        }
    }else {
        res.status(400);
        res.send({ msg: 'Basic authorization required' });
    }
});

authRouter.delete('/login', (req, res) => {
    if(authDB.isUser(req.user)) {
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

authRouter.put('/artists', async (req, res) => {
    const id = req.body.artistId;
    const user = req.user;
    if(!authDB.isUser(user)) {
        res.status(401);
        res.send({ error: 'Unauthorized' });
        return;
    }

    if(!id) {
        res.status(400);
        res.send({ error: 'Missing required artistId' });
        return;
    }

    const albums = await spotAPI.getAlbums(id)
    const artist = await spotAPI.getArtist(id)
    if(!albums || !artist) {
        res.status(400);
        res.send({ error: 'Invalid artistId' });
        return;
    }

    dataDB.addArtist(id, artist.name, albums);
    dataDB.subscribe(user, id);
    res.send({ success: true })
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
        res.status(400);
        res.send({ error: 'Missing required artistId' });
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

app.use('/api', apiRouter);
app.use('/api', authRouter);

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

module.exports = app;
