const express = require('express');
const app = express();

const auth = require('./auth.js');
const authDB = new auth();

app.use(express.json());

app.use(express.static('public'));

const apiRouter = express.Router({ caseSensitive: true });
const authRouter = express.Router({ caseSensitive: true });

authRouter.use((req, res, next) => {
    let token = auth.parseAuth(req, 'Bearer');
    let user = authDB.getUser(token);

    console.log(user + '@' + token);
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
    console.log(req.user);
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
})

app.use('/api', apiRouter);
app.use('/api', authRouter);

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

module.exports = app;
