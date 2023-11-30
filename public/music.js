tableOpts.columns = [
    { title: "Artist" },
    { title: "Album" },
    { title: "Status" },
    { title: "album_id", visible: false }
];

let statusCol = colToInd("Status");
let idCol = colToInd("album_id");

tableOpts.columnDefs = [{
    targets: colToInd("Album"),
    render: buildURL("https://open.spotify.com/album/", colToInd("album_id"))
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
let tableID = "music-table";

async function getData() {
    let data = [];

    const auth = bearer();
    if(auth) {
        const res = await fetch('/api/albums', { headers: auth })
            .catch((e) => console.log(e));

        if(res.status == 200) {
            data = await res.json();
            data = data.map((album) => [
                album.artist,
                album.album,
                album.status,
                album.id
            ]);

            data = data.filter((row) => row[statusCol] !== 'Checked' );

            localStorage.setItem(tableID, JSON.stringify(data));
        }else if(res.status == 401) {
            authExpired();
        }else {
            const storedData = localStorage.getItem(tableID);
            if(storedData !== null) {
                data = JSON.parse(storedData);
            }
        }
    }

    return data;
}

function markVisited(el) {
    selectDo(el, setStatus('Visited'));
}

function markNewRelease(el) {
    selectDo(el, setStatus('New Release'));
}

function markChecked(el) {
    selectDo(el, setStatus('Checked'));
}

function setStatus(val) {
    return (selectedRow) => {
        let rowData = selectedRow.data();
        let rowInd = selectedRow.index();

        rowData[statusCol] = val;
        const auth = bearer();
        if(auth) {
            auth['Content-Type'] = 
            fetch('/api/albums', {
                method: 'PUT',
                headers: auth,
                body: JSON.stringify({ albumId: rowData[idCol], status: val})
            }).then((res) => {
                if(!res.ok)
                    return false;
                data[rowInd][statusCol] = val;

                if(val === 'Checked') {
                    selectedRow.remove();
                    table.draw();
                }else {
                    selectedRow.data(rowData);
                }
            });
        }

        return false;
    }
}
