const fs = require('fs')

const tokenPath = 'auth/token.id';

const id = fs.readFileSync('auth/client.id').toString();
const secret = fs.readFileSync('auth/secret.id').toString();

class spotify {
    #token;

    constructor() {
        if(fs.existsSync(tokenPath)) {
            this.#token = fs.readFileSync(tokenPath).toString();
        }else{
            this.#getToken();
        }
    }

    #getToken() {
        const auth = btoa(id + ':' + secret);
        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials',
            json: true
        })
            .then((res) => res.json())
            .then((data) => {
                this.#token = data.access_token;
                fs.writeFileSync(tokenPath, this.#token);
            });
    }

    #getOpts() {
        return {methd: 'GET', headers: {
            Authorization: 'Bearer ' + this.#token
        }}
    }

    async #get(endpoint, retry = true) {
        const url = 'https://api.spotify.com/v1/' + endpoint;
        const res = await fetch(url, this.#getOpts());

        const obj = await res.json();
        if('error' in obj) {
            if(res.status == 401) {
                this.#getToken();
                return this.#get(endpoint, false);
            }
            console.log(obj, endpoint);
            return false;
        }

        return obj;
    }

    async searchArtist(query) {
        const obj = await this.#get('search?q=' + encodeURI(query) +
            '&type=artist');

        if(!obj)
            return null;

        return obj.artists.items.map((artist) => {
            return { _id: artist.id, name: artist.name };
        });
    }

    async getAlbums(artistId) {
        const url = `artists/${artistId}/albums?include_groups=album&limit=50`;
        const obj = await this.#get(url);

        if(!obj)
            return null;

        return obj.items.map((album) => {
            return { _id: album.id, name: album.name }
        });
    }

    async getArtist(artistId) {
        const artist = await this.#get(`artists/${artistId}`);

        if(!artist)
            return null;

        return artist;
    }
}

module.exports = spotify;
