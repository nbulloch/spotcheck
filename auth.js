const crypto = require('crypto');
const bcrypt = require('bcrypt');
const salt_rounds = 10;

const DB = require('./db.js');

class auth {
    static parseAuth(req, type) {
        let auth = req.header('Authorization');

        if(!auth)
            return null;

        auth = auth.split(" ");
        if(auth[0] !== type || auth.length != 2)
            return null;

        return auth[1];
    }

    static basicAuth(req) {
        let basic = auth.parseAuth(req, 'Basic');

        basic = atob(basic)
        let cred = basic.split(':');
        if(cred.length != 2)
            return null;

        return cred;
    }

    createToken(username) {
        let token = crypto.randomUUID();
        DB.addToken(token, username);
        return token;
    }

    deleteToken(token) {
        DB.deleteToken(token);
    }

    isUser(username) {
        return DB.isUser(username);
    }

    getUser(token) {
        if(!token)
            return null;

        return DB.getUser(token);
    }

    async createUser(username, password) {
        const salt = bcrypt.genSaltSync(salt_rounds);
        const hash = bcrypt.hashSync(password, salt);

        const added = await DB.addUser(username, hash);
        if(added) {
            return this.createToken(username);
        }

        return null;
    }

    deleteUser(user) {
        DB.isUser(user).then(exists => {
            if(exists) {
                DB.deleteUser(user);
                return true;
            }

            return false;
        });
    }

    async checkLogin(username, password) {
        let hash = await DB.getHash(username);

        return hash !== null &&
            bcrypt.compareSync(password, hash);
    }
}

module.exports = auth;
