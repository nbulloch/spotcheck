const http = require('http');
const request = require('supertest');
//const app = "localhost:4000";
const app = http.createServer(require('./server.js'));

const finish = function(done) {
    return (err) => (err ? done(err) :  done());
}

const hasToken = function(res) {
    if(!'token' in res.body)
        throw new Error('missing token');
    return true;
}

const username = 'test_user';
const password = 'test_pass';
let token = "";

beforeAll(async () => {
    const res = await request(app)
        .post('/api/user')
        .auth(username, password)
        .expect(200)

    token = res.body.token;
    expect(token);
})

let req;

const setBearer = function() {
    req = request.agent(app)
        .auth(token, { type: 'bearer' });

    return req;
}

beforeEach(setBearer);

describe('Artist endpoint', () => {

    test('Artist', async () => {
        let res = await setBearer()
            .put('/api/artists')
            .send({ artistId: '12Chz98pHFMPJEknJQMWvI' });
        expect(res.status).toEqual(200);

        res = await setBearer()
                    .get('/api/artists');
        expect(res.status).toEqual(200);
        expect(res.body.length).toEqual(1);

        res = await setBearer()
            .delete('/api/artists')
            .send({ artistId: '12Chz98pHFMPJEknJQMWvI' });
        expect(res.status).toEqual(200);

        res = await setBearer()
                    .get('/api/artists');
        expect(res.status).toEqual(204);

        res = await setBearer()
            .delete('/api/artists')
            .send({ artistId: 'not an id' });
        expect(res.status).toEqual(200);
        expect(res.body.success).toEqual(false);

        res = await setBearer()
            .put('/api/artists')
            .send({ artistId: 'not an id' })
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual('Invalid artistId');
    });
});

/*
describe('Album endpoint', () => {

    test('update album', (done) => {
        req
            .put('/api/albums')
            .send({ albumId: '5qK8S5JRF8au6adIVtBsmk', status: 'Visited' })
            .expect(200)
            .end(finish(done));

        req
            .put('/api/albums')
            .send({ albumId: '5qK8S5JRF8au6adIVtBsmk', status: 'bad status' })
            .expect(400)
            .expect({ error: 'Invalid status' })
            .end(finish(done));

        req
            .put('/api/albums')
            .send({ albumId: 'not an id', status: 'New Release' })
            .expect(400)
            .expect({ error: 'Invalid albumId' })
            .end(finish(done));
    });

    test('list albums', (done) => {
        req
            .get('/api/albums')
            .expect(200)
        // Check updated
            .end(finish(done));
    });
});
*/

describe('Search endpoint', () => {
    test('search for an artist', (done) => {
        req
            .get('/api/search/Muse')
            .expect(200)
            .expect((res) => {
                res.body.some((item) => item.name === 'Muse')
            })
            .end(finish(done));
    });
});

describe('Login endpoint', () => {

    test('login', (done) => {
        req
            .post('/api/login')
            .auth(username, password)
            .expect(200)
            .expect(hasToken)
            .end(finish(done));
    });

    test('logout', (done) => {
        req
            .delete('/api/login')
            .expect(200)
            .end(() => {
                setBearer()
                    .get('/api/artists')
                    .expect(401)
                    .end(finish(done))
            });

    });
});

describe('User endpoint', () => {

    test('register new user', (done) => {
        request(app)
            .post('/api/user')
            .auth('new_user', password)
            .expect(hasToken)
            .expect(200)
            .end(() => {
                request(app)
                    .post('/api/user')
                    .auth(username, password)
                    .expect(403)
                    .expect({ msg: 'Username taken' })
                    .end(finish(done));
            });
    });

    test('delete account', (done) => {
        req
            .delete('/api/user')
            .expect(200)
            .end(() => {
                setBearer()
                    .delete('/api/user')
                    .expect(401)
                    .end(finish(done));
            });
    });
});
