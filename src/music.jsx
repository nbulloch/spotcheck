import React from 'react';

import { Table } from './table';
import { QueryButton } from './queryButton';

import './layout.css';

    //<button onclick='markVisited(this)'>Mark Visited</button>
    //<button onclick='markNewRelease(this)'>Mark New Release</button>
    //<button onclick='markChecked(this)'>Mark Checked</button>
    //<table id='music-table' className='display compact'></table>
export default function Music() {
    return (
        <main className='aside-layout'>
            <div className='aside'>
                <QueryButton text='Mark Visited' />
                <QueryButton text='Mark New Release' />
                <QueryButton text='Mark Checked' />
                <div id='console'></div>
            </div>
            <div className='content'>
                <Table className='display compact' />
            </div>
        </main>
    );
}
