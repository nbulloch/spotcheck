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
let endpoint;

const setBearer = function() {
    console.log(token);
    req = request.agent(app)
        .auth(token, { type: 'bearer' });

    return req;
}

beforeEach(setBearer);
/*
describe('Artist endpoint', () => {

    beforeAll(() => endpoint = '/api/artists');

    test('add artist', (done) => {
        req
            .put(endpoint)
            .send({ artistId: '12Chz98pHFMPJEknJQMWvI' })
            .expect(200)
            .end(finish(done));

        req
            .put(endpoint)
            .send({ artistId: 'not an id' })
            .expect(400)
            .expect({ msg: 'Invalid artistId' })
            .end(finish(done))
    });

    test('list artists', (done) => {
        req
            .get(endpoint)
            .expect(200)
        // Check that artist was added
            .end(finish(done));
    });

    test('delete artist', (done) => {
        req
            .delete(endpoint)
            .send({ artistId: '12Chz98pHFMPJEknJQMWvI' })
            .expect(200)
        // Check that artist was deleted
            .end(finish(done));

        req
            .delete(endpoint)
            .send({ artistId: 'not an id' })
            .expect(400)
            .expect({ msg: 'Invalid artistId' })
            .end(finish(done))
    });
});

describe('Album endpoint', () => {

    beforeAll(() => endpoint = '/api/albums');

    test('update album', (done) => {
        req
            .put(endpoint)
            .send({ albumId: '5qK8S5JRF8au6adIVtBsmk', status: 'Visited' })
            .expect(200)
            .end(finish(done));

        req
            .put(endpoint)
            .send({ albumId: '5qK8S5JRF8au6adIVtBsmk', status: 'bad status' })
            .expect(400)
            .expect({ msg: 'Invalid status' })
            .end(finish(done));

        req
            .put(endpoint)
            .send({ albumId: 'not an id', status: 'New Release' })
            .expect(400)
            .expect({ msg: 'Invalid albumId' })
            .end(finish(done));
    });

    test('list albums', (done) => {
        req
            .get(endpoint)
            .expect(200)
        // Check updated
            .end(finish(done));
    });
});

/*
describe('Search endpoint', () => {

    beforeAll(() => endpoint = '/api/search');

    test('search for an artist', (done) => {
        req
            .get(endpoint)
            .send({ artist: 'Muse' })
            .expect(200)
        // check search output
            .end(finish(done));
    });
});
*/

describe('Login endpoint', () => {

    beforeAll(() => endpoint = '/api/login');

    test('login', (done) => {
        req
            .post(endpoint)
            .auth(username, password)
            .expect(200)
            .expect(hasToken)
            .end(finish(done));
    });

    test('logout', (done) => {
        req
            .delete(endpoint)
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

    beforeAll(() => endpoint = '/api/user');

    test('register new user', (done) => {
        request(app)
            .post(endpoint)
            .auth('new_user', password)
            .expect(hasToken)
            .expect(200)
            .end(() => {
                request(app)
                    .post(endpoint)
                    .auth(username, password)
                    .expect(403)
                    .expect({ msg: 'Username taken' })
                    .end(finish(done));
            });
    });

    test('delete account', (done) => {
        req
            .delete(endpoint)
            .expect(200)
            .end(() => {
                setBearer()
                    .delete(endpoint)
                    .expect(401)
                    .end(finish(done));
            });
    });
});
