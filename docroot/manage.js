tableOpts.columns = [
    { title: "Artist" },
    { title: "Albums Checked" },
    { title: "artist_id", visible: false }
];

let artistCol = colToInd("Artist");

tableOpts.columnDefs = [{
    targets: artistCol,
    render: buildURL("https://open.spotify.com/artist/", colToInd("artist_id"))
}];

let data = localStorage.getItem("manage-table");
if(data) {
    data = JSON.parse(data);
}else {
    data = [
        ["Muse",           "5 of 10", "12Chz98pHFMPJEknJQMWvI"],
        ["Imagine Dragons","8 of 9",  "53XhwfbYqKCa1cC15pYq2q"]
    ];
}
tableOpts.data = data;

let table;
let tableID = "manage-table";
window.onload = function(){
    table = new DataTable("#" + tableID, tableOpts);
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

    let nMatches = randInt(1, 6);

    for(let i = 0; i < nMatches; i++) {
        let optText = artist;
        if(i != 0) {
            optText += " Alt " + i;
        }
        selection.add(new Option(optText));
    }
}

function unsubscribe(el) {
    selectDo(el, deleteRow(data));
}

function subscribe(el) {
    let artist = document.getElementById("artistSelect");

    artist = artist.value;
    if(artist.length == 0) {
        flashBtn(el);
        return;
    }

    //Enforce unique rows
    //use id once we are calling API
    if(data.some((row) => {
        console.log(row);
        console.log(row[artistCol]);
        console.log(artist);
        return row[artistCol] === artist;
    })) {
        flashBtn(el);
        return;
    }

    let totalAlbums = randInt(1, 15);
    let numChecked = randInt(0, totalAlbums) + " of " + totalAlbums;

    appendRow([artist, numChecked, "TODO artist_id"]);

    storeTable();
}

function appendRow(rowData) {
    if(!table)
        return;

    table.row.add(rowData);
    table.draw();

    data.push(rowData);
}
