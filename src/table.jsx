import React from 'react';

//https://cdn.datatables.net/v/dt/jq-3.7.0/dt-1.13.6/sl-1.7.0/datatables.min.js
//import './libs/datatables.min';
//https://cdn.datatables.net/v/dt/jq-3.7.0/dt-1.13.6/sl-1.7.0/datatables.min.css
import './libs/datatables.min.css';

const DataTable = window.DataTable;

export function colToInd(columns, name) {
    return columns.findIndex((col) => col.title === name);
}

export function selectDo(table, fn) {
    if(!table)
        return false;

    let selectedRow = table.row({ selected: true });
    if(selectedRow.length == 0) {
        return false;
    }

    return fn(selectedRow);
}

export function buildURL(link, dataCol) {
    return function(data, type, row) {
        if(type === "display") {
            return "<a class='tbl-link' target='_blank' href=" + link + row[dataCol] + ">" + data + "</a>";
        }

        return data;
    };
}

export function Table({ id, rowId, data, columns, columnDefs, load }) {
    const [table, setTable] = React.useState();

    const tableOpts = {
        data: data,
        pagingType: 'simple',
        select: true,
        info: false,
        order: []
    }
    if(rowId) {
        tableOpts.rowId = rowId;
    }
    if(columns) {
        tableOpts.columns = columns;
    }
    if(columnDefs) {
        tableOpts.columnDefs = columnDefs;
    }

    React.useEffect(() => {
        const newTable = new DataTable('#' + id, tableOpts)
        setTable(newTable);
        load(newTable);
    }, [id]); //on DOM insertion

    React.useEffect(() => {
        if(table) {
            table.clear();
            table.rows.add(data);
            table.draw();
        }
    }, [data]);

    const tableEl = React.useMemo(() => {
        return <table id={ id } className='display compact'></table>;
    }, []); //Never rerender

    return tableEl;
}
