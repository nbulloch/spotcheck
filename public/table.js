window.tableOpts = {
    pagingType: 'simple',
    select: true,
    info: false,
    order: []
};

function selectDo(el, fn) {
    console.log(table);
    if(!table)
        return;

    let selectedRow = table.row({ selected: true });
    if(selectedRow.length == 0) {
        flashBtn(el);
        return;
    }

    fn(selectedRow);

    storeTable();
}

function storeTable() {
    localStorage.setItem(tableID, JSON.stringify(data));
}

function colToInd(name) {
    return tableOpts.columns.findIndex((col) => col.title === name);
}

function deleteRow(data) {
    return (selectedRow) => {
        let rowInd = selectedRow.index();

        selectedRow.remove();
        table.draw();

        data.splice(rowInd, 1);
    };
}

function buildURL(link, dataCol) {
    return function(data, type, row) {
        if(type === "display") {
            return "<a class='tbl-link' target='_blank' href=" + link + row[dataCol] + ">" + data + "</a>";
        }

        return data;
    };
}
