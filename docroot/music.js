tableOpts.columns = [
    { title: "Artist" },
    { title: "Album" },
    { title: "Status" },
    { title: "album_id", visible: false }
];

let statusCol = colToInd("Status");

tableOpts.columnDefs = [{
    targets: colToInd("Album"),
    render: buildURL("https://open.spotify.com/album/", colToInd("album_id"))
}];

let data = localStorage.getItem("music-table");
if(data) {
    data = JSON.parse(data);
}else {
    data = [
        ["Muse",           "Will of the People","Visited",    "5qK8S5JRF8au6adIVtBsmk"],
        ["Imagine Dragons","Night Visions",      "New Release","0LLA5YL3g2UReWlP7nWqGh"],
    ];
}
tableOpts.data = data;

let table;
let tableID = "music-table";
window.onload = function(){
    table = new DataTable("#" + tableID, tableOpts);
}

function markVisited(el) {
    selectDo(el, setStatus("Visited"));
}

function markNewRelease(el) {
    selectDo(el, setStatus("New Release"));
}

function markChecked(el) {
    selectDo(el, deleteRow(data));
}

function setStatus(val) {
    return (selectedRow) => {
        let rowData = selectedRow.data();
        let rowInd = selectedRow.index();

        rowData[statusCol] = val;
        data[rowInd][statusCol] = val;

        selectedRow.data(rowData);
    }
}
