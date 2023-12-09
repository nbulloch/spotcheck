import React from 'react';

import { Table, selectDo, buildURL, colToInd } from './table';
import Button from './button';

import './layout.css';

let table;
const setTable = (loadedTable) => table = loadedTable;

export default function Manage({ data, client, refreshData }) {
    let tableData = [];
    if(data) {
        tableData = data.map((artist) => [
            artist.name,
            artist.checkedAlbums + ' of ' + artist.totalAlbums,
            artist.id
        ]);
    }

    const columns = [
        { title: "Artist" },
        { title: "Albums Checked" },
        { title: "artist_id", visible: false }
    ];

    const artistCol = colToInd(columns, "Artist");
    const idCol = colToInd(columns, "artist_id");

    const columnDefs = [{
        targets: artistCol,
        render: buildURL("https://open.spotify.com/artist/",
                    colToInd(columns, "artist_id"))
    }];

    const [artist, setArtist] = React.useState('');
    const [artists, setArtists] = React.useState([]);
    const [sub, setSub] = React.useState('');

    const artistIn = (e) => setArtist(e.target.value);

    let artistOptions = <option value="">--Select an Artist--</option>;
    if(artists.length > 0) {
        artistOptions = artists.map((artist) => {
            return (
                <option key={ artist.id } onClick={ () => setSub(artist.id) }>
                    { artist.name }
                </option>
            );
        });
    }

    function search() {
        if(artist.length == 0)
            return false;

        let newArtists = [];
        const success = client.getService('/api/search/' + artist).then((res) => {
            if('msg' in res)
                return false;

            res.forEach((artist) =>
                newArtists.push({ name: artist.name, id: artist.id }));

            setArtists(newArtists);
            return true;
        }).catch((err) => false);

        return success
    }

    function subscribe() {
        if(sub.length == 0)
            return false;

        //Enforce unique rows
        if(tableData.some((row) => row[idCol] === sub))
            return false;

        const success = client.getService('/api/artists', {
            method: 'PUT',
            body: JSON.stringify({ artistId: sub })
        }).then((res) => {
            if('msg' in res)
                return false;

            refreshData();
            return true;
        }).catch((err) => false);

        return success;
    }

    function appendRow(rowData) {
        if(!table)
            return;

        table.row.add(rowData);
        table.draw();

        tableData.push(rowData);
    }

    function unsubscribe() {
        return selectDo(table, (selectedRow) => {
            const rowInd = selectedRow.index();
            const artistId = selectedRow.data()[idCol];

            const success = client.getService('/api/artists', {
                method: 'DELETE',
                body: JSON.stringify({ artistId: artistId })
            }).then((res) => {
                if('msg' in res)
                    return false;

                selectedRow.remove();
                table.draw();

                tableData.splice(rowInd, 1);
                //Does this render?

                refreshData();
                return true;
            }).catch((err) => false);

            return success;
        });
    }

    const tableEl = React.useMemo(() => {
        return (
            <Table id="manage-table"
                data={ tableData }
                columns={ columns }
                columnDefs={ columnDefs }
                load={ setTable }
            />
        );
    }, [data]);

    return (
        <main className='aside-layout'>
            <div className="aside">
                <div>
                    <input id="artistName" type="text" onChange={ artistIn }
                        placeholder="Find Artist"></input>
                </div>
                <div>
                    <Button onClick={ search } text='Search' />
                </div>
                <div>
                    <select id="artistSelect" size={4}>
                        { artistOptions }
                    </select>
                </div>
                <div>
                    <Button onClick={ subscribe } text='Subscribe' />
                </div>
                <hr />
                <div>
                    <Button onClick= { unsubscribe } text='Unsubscribe' />
                </div>
                <div id="console"></div>
            </div>
            <div className="content">
            { tableEl }
            </div>
        </main>
    );
}
