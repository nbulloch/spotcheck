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
        this.#users.set(username, password);
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
        let pwd = this.#users.get(username);

        return pwd && pwd == password;
    }
}

module.exports = auth;
