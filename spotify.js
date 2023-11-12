const fs = require('fs')

const tokenPath = 'auth/token.id';

const id = fs.readFileSync('auth/client.id').toString();
const secret = fs.readFileSync('auth/secret.id').toString();

class spotify {
    #token;

    constructor() {
        this.#getToken();
    }

    #getToken() {
        if(fs.existsSync(tokenPath)) {
            this.#token = fs.readFileSync(tokenPath).toString();
        }else{
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
    }

    #getOpts() {
        return {methd: 'GET', headers: {
            Authorization: 'Bearer ' + this.#token
        }}
    }

    async searchArtist(query) {
        const url = 'https://api.spotify.com/v1/search?q=' +
            encodeURI(query) + '&type=artist';
        const res = await fetch(url, this.#getOpts());
        const json = await res.json();

        console.log(json);
        if('error' in json)
            return null;

        return json.artists.items.map((artist) => {
            return { id: artist.id, name: artist.name };
        });
    }

    async getAlbums(artistId) {
        const url = `https://api.spotify.com/v1/artists/${artistId}/albums`;
        const res = await fetch(url, this.#getOpts());
        const json = await res.json();

        return json.items.map((album) => {
            return { id: album.id, name: album.name }
        });
    }
}

module.exports = spotify;
