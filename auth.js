const crypto = require('crypto');
const bcrypt = require('bcrypt');
const salt_rounds = 10;

class auth {
    #tokens;
    #users;

    constructor() {
        this.#tokens = new Map();
        this.#users = new Map();
    }

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
        this.#tokens.set(token, username);
        return token;
    }

    clearTokens(username) {
        for(const [token, user] of this.#tokens) {
            if(user === username) {
                this.#tokens.delete(token);
            }
        }
    }

    deleteToken(token) {
        this.#tokens.delete(token);
    }

    isUser(username) {
        return this.#users.has(username);
    }

    getUser(token) {
        if(!token)
            return null;

        if(!this.#tokens.has(token))
            return null;

        return this.#tokens.get(token);
    }

    createUser(username, password) {
        bcrypt.hash(password, salt_rounds).then((hash) => {
            this.#users.set(username, hash);
        });
        return this.createToken(username);
    }

    deleteUser(user) {
        if(isUser(user)) {
            this.#users.delete(user);
            this.clearTokens(user);

            return true;
        }

        return false;
    }

    checkLogin(username, password) {
        let hash = this.#users.get(username);

        return hash && bcrypt.compareSync(password, hash);
    }
}

module.exports = auth;
