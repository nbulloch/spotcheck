tableOpts.columns = [
    { title: "Artist" },
    { title: "Albums Checked" },
    { title: "artist_id", visible: false }
];

let artistCol = colToInd("Artist");
let idCol = colToInd("artist_id");

tableOpts.columnDefs = [{
    targets: artistCol,
    render: buildURL("https://open.spotify.com/artist/", colToInd("artist_id"))
}];

let data;
getData().then((out) => {
    data = out;
    tableOpts.data = data;

    $(document).ready(function(){
        table = new DataTable("#" + tableID, tableOpts);
    });
});

let table;
let tableID = "manage-table";

async function getData() {
    let data = [];

    const auth = bearer();
    if(auth) {
        const res = await fetch('/api/artists', { headers: auth });

        if(res.status == 200) {
            data = await res.json();
            data = data.map((artist) => [
                artist.name,
                artist.checkedAlbums + ' of ' + artist.totalAlbums,
                artist.id
            ]);
            localStorage.setItem(tableID, data);
        }
    }else {
        data = localStorage.getItem(tableID);
    }

    return data;
}

function search(el) {
    let artist = document.getElementById("artistName").value;
    if(artist.length == 0){
        flashBtn(el);
        return;
    }

    let selection = document.getElementById("artistSelect");
    let opts = selection.children;
    while(opts.item(1)) {
        opts.item(1).remove();
    }

    fetch('/api/search/' + artist).then((res) => {
        if(res.ok) {
            res.json().then((body) => {
                body.forEach((artist) => {
                    selection.add(new Option(artist.name, artist.id));
                });
            });
        }
    });
}

function unsubscribe(el) {
    const auth = bearer();
    if(!auth) {
        flashBtn(el);
    }else {
        selectDo(el, (selectedRow) => {
            const rowInd = selectedRow.index();
            const artistId = selectedRow.data()[idCol];

            fetch('/api/artists', {
                method: 'DELETE',
                headers: auth,
                body: JSON.stringify({ artistId: artistId })
            }).then((res) => {
                res.json().then((body) => {
                    if(body.success) {
                        selectedRow.remove();
                        table.draw();

                        data.splice(rowInd, 1);
                    }
                });
            });
        });
    }
}

function subscribe(el) {
    let artist = document.getElementById("artistSelect");

    const auth = bearer();
    if(!auth) {
        flashBtn(el);
        return;
    }

    artist = artist.value;
    if(artist.length == 0) {
        flashBtn(el);
        return;
    }

    //Enforce unique rows
    if(data.some((row) => {
        return row[idCol] === artist;
    })) {
        flashBtn(el);
        return;
    }

    fetch('/api/artists', {
        method: 'PUT',
        headers: auth,
        body: JSON.stringify({ artistId: artist })
    }).then((res) => {
        if(res.ok) {
            getData().then((freshData) => {
                data = freshData;
                table.clear();
                table.rows.add(freshData);
                table.draw();

                storeTable();
            });
        }
    });
}

function appendRow(rowData) {
    if(!table)
        return;

    table.row.add(rowData);
    table.draw();

    data.push(rowData);
}
