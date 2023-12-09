import React from 'react';

import { Table, selectDo, buildURL, colToInd } from './table';
import Button from './button';

import './layout.css';

let table;
const setTable = (loadedTable) => table = loadedTable;

export default function Music({ data, putAlbum, setNotify }) {
    let tableData = [];
    if(data) {
        tableData = data.filter((album) => album.status !== 'Checked' );
        tableData = tableData.map((album) => [
            album.artist,
            album.album,
            album.status,
            album.id
        ]);
    }

    const columns = [
        { title: 'Artist' },
        { title: 'Album' },
        { title: 'Status' },
        { title: 'album_id', visible: false }
    ];

    const statusCol = colToInd(columns, 'Status');
    const idCol = colToInd(columns, 'album_id');

    const columnDefs = [{
        targets: colToInd(columns, 'Album'),
        render: buildURL('https://open.spotify.com/album/', colToInd(columns, 'album_id'))
    }];

    const markNewRelease = () => selectDo(table, setStatus('New Release'));
    const markVisited = () => selectDo(table, setStatus('Visited'));
    const markChecked = () => selectDo(table, setStatus('Checked'));

    function setStatus(val) {
        return (selectedRow) => {
            let rowData = selectedRow.data();
            let rowInd = selectedRow.index();

            rowData[statusCol] = val;
            const body = { albumId: rowData[idCol], status: val };
            const success = putAlbum(body).then((res) => {
                if('msg' in res)
                    return false;
                tableData[rowInd][statusCol] = val;

                const newAlbums = tableData.filter((album) =>
                        album[statusCol] === 'New Release');
                setNotify(newAlbums.length);

                if(val === 'Checked') {
                    selectedRow.remove();
                    table.draw();
                }else {
                    selectedRow.data(rowData);
                }
                return true
            }).catch((err) => false);

            return success;
        }
    }

    return (
        <main className='aside-layout'>
            <div className='aside'>
                <Button text='Mark New Release' onClick={ markNewRelease } />
                <Button text='Mark Visited' onClick={ markVisited } />
                <Button text='Mark Checked' onClick={ markChecked } />
                <div id='console'></div>
            </div>
            <div className='content'>
                <Table
                    id='music-table'
                    data={ tableData }
                    columns={ columns }
                    columnDefs={ columnDefs }
                    load={ setTable }
                />
            </div>
        </main>
    );
}
