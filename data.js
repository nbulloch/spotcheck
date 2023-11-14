class data {
    #artists;
    #albums;
    #subs;
    #stats;

    constructor() {
        this.#artists = new Map(); //artistId -> {name, albumIds}
        this.#albums = new Map();  //albumId -> name
        this.#subs = new Map();    //user -> [artistId, ...]
        this.#stats = new Map();   //user -> [{albumId, status}, ...]
    }

    addArtist(id, name, albums) {// albums = [{id, name}]
        const albumIds = albums.map((album) => album.id);
        this.#artists.set(id, {name: name, albumIds: albumIds});

        albums.forEach((album) => this.addAlbum(album.id, album.name));
    }

    deleteArtist(id) {
        this.#artists.delete(id);
    }

    updateArtist(id, name, albums) {
        this.addArtist(id, name, albums);
        for(const [user, artistId] of this.#subs) {
            if(artistId === id) {
                this.subscribe(user, artistId);
            }
        }
    }

    subscribe(user, artistId) {
        let artist = this.#artists.get(artistId);
        if(!artist)
            return false;

        if(!this.#subs.has(user)) {
            this.#subs.set(user, []);
        }

        let userSubs = this.#subs.get(user);
        if(!userSubs.includes(artistId)) {
            artist.albumIds.forEach((albumId) => {
                if(!this.hasStatus(user, albumId)){
                    this.setStatus(user, albumId, 'New Release')
                }
            });
            userSubs.push(artistId);


            return true;
        }
        return false;
    }

    listArtists(user) {
        const artistIds = this.#subs.get(user);
        if(!artistIds)
            return null;

        return artistIds.map((id) => {
            const artist = this.#artists.get(id);
            const albumIds = artist.albumIds;

            const checked = this.#stats.get(user).filter((stat) => {
                return albumIds.includes(stat.albumId) &&
                    stat.status === 'Checked';
            });

            return {
                id: id,
                name: artist.name,
                checkedAlbums: checked.length,
                totalAlbums: albumIds.length
            };
        });
    }

    unsubscribe(user, artistId) {
        let success = false;

        let artistIds = this.#subs.get(user);
        if(artistIds) {
            const filtered = artistIds.filter((id) => id !== artistId );
            if(filtered.length !== artistIds.length) {
                this.#subs.set(user, filtered);
                success = true;
            }
        }

        let stats = this.#stats.get(user);
        if(stats) {
            const artist = this.#artists.get(artistId);
            if(artist) {
                const albumIds = artist.albumIds;
                const filtered = stats.filter((stat) => {
                    return !albumIds.includes(stat.albumId);
                });

                if(filtered.length != stats.length) {
                    this.#stats.set(user, filtered);
                    success = true;
                }
            }
        }

        return success;
    }

    addAlbum(id, name) {
        this.#albums.set(id, name);
    }

    removeAlbum(id) {
        this.#albums.delete(id);
    }

    listAlbums(user) {
        const userStats = this.#stats.get(user);
        if(!userStats)
            return null;

        const userArtists = this.#stats.get(user);
        if(!userStats)
            return null;

        return userStats.map((stat) => {
            const albumId = stat.albumId;
            const status = stat.status;
            const album = this.#albums.get(albumId);
            let artistName = null;
            for(const artist of this.#artists.values()) {
                if(artist.albumIds.includes(albumId)) {
                    artistName = artist.name;
                    break;
                }
            }

            return {
                id: albumId,
                artist: artistName,
                album: album,
                status: status
            };
        });
    }

    setStatus(user, albumId, status) {
        if(['New Release', 'Visited', 'Checked'].includes(status)) {
            if(!this.#stats.has(user)) {
                this.#stats.set(user, []);
            }
            const statusArray = this.#stats.get(user);
            const ind = statusArray.findIndex((stat) => {
                return stat.albumId === albumId;
            });

            if(ind != -1) {
                const stat = statusArray[ind];
                stat.status = status;
                statusArray[ind] = stat;
            }else {
                statusArray.push({albumId: albumId, status: status});
            }

            return true;
        }

        return false;
    }

    hasStatus(user, albumId) {
        const stat = this.#stats.get(user);

        if(!stat)
            return false;

        return stat.some((album) => album.albumId === albumId);
    }
}

module.exports = data;
