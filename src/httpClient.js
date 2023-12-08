class httpClient {
    authHeader;
    callbacks = {};

    onStatus(code, cb) {
        this.callbacks[code] = cb;
    }

    clearStatus(code) {
        delete this.callbacks[code];
    }

    setToken(token) {
        this.authHeader = { 'Authorization': 'Bearer ' + token };
    }

    clearAuth() {
        delete this.authHeader;
    }

    reset() {
        callbacks = {};
        clearAuth();
    }

    async getService(endpoint, opts) {
        if(!opts) {
            opts = {};
        }

        if(this.authHeader) {
            opts.headers = this.authHeader; // No other headers required
        }

        const resp = await fetch(endpoint, opts);

        if(resp.status in this.callbacks) {
            this.callbacks[resp.status]();
        }

        if(resp.status != 200 && resp.status != 204) {
            return 'get error msg';
        }else {
            return await resp.json();
        }
    }
}

export default httpClient;
