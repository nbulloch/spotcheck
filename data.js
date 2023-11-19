const DB = require('./db.js');

class data {
    addArtist(id, name, albums) {// albums = [{id, name, artistId}]
        DB.addArtist({ _id: id, name: name });
        DB.setAlbums(id, albums);
    }

    deleteArtist(id) {
        DB.deleteArtist(id);
    }

    updateArtist(id, name, albums) {
        DB.updateArtist({ _id: id, name: name });
        DB.setAlbums(id, albums);
    }

    subscribe(user, artistId) {
        DB.subscribe(user, artistId);
    }

    listArtists(user) {
        return DB.listArtists(user);
    }

    unsubscribe(user, artistId) {
        return DB.unsubscribe(user, artistId);
    }

    listAlbums(user) {
        return DB.listAlbums(user);
    }

    setStatus(user, albumId, status) {
        if(['New Release', 'Visited', 'Checked'].includes(status)) {
            DB.setStatus(user, albumId, status);
            return true;
        }

        return false;
    }

    hasStatus(user, albumId) {
        return DB.hasStatus(user, albumId);
    }
}

module.exports = data;
