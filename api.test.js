const http = require('http');
const request = require('supertest');
const app = require('./server.js');

const finish = function(done) {
    return (err) => (err ? done(err) :  done());
}

const hasToken = function(res) {
    if(!'token' in res.body)
        throw new Error('missing token');
}

const username = 'test_user';
const password = 'test_pass';
//Get a token

let token;
let req;
let endpoint;

beforeEach(() => {
    req = request.agent(http.createServer(app))
        .auth(token, { type: 'bearer' });
})

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

describe('Login endpoint', () => {

    beforeAll(() => endpoint = '/api/login');

    test('login', (done) => {
        req
            .get(endpoint)
            .auth(username, password)
            .expect(200)
            .expect(hasToken)
            .end(finish(done));
    });

    test('logout', (done) => {
        req
            .delete(endpoint)
            .expect(200)
            .end(finish(done));

        req
            .get('/api/artists')
            .expect(401)
            .end(finish(done))
    });
});

describe('User endpoint', () => {

    beforeAll(() => endpoint = '/api/user');

    test('register new user', (done) => {
        req
            .post(endpoint)
            .auth(username, password)
            .expect(hasToken)
            .expect(200)
            .end(finish(done));

        req
            .post(endpoint)
            .auth(username, password)
            .expect(hasToken)
            .expect(403)
            .end(finish(done));
    });

    test('delete account', (done) => {
        req
            .put(endpoint)
            .expect(200)
            .end(finish(done));

        req
            .put(endpoint)
            .expect(401)
            .end(finish(done));
    });
});
