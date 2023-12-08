import { createElement } from 'react';

//https://cdn.datatables.net/v/dt/jq-3.7.0/dt-1.13.6/sl-1.7.0/datatables.min.js
import './libs/datatables.min';
//https://cdn.datatables.net/v/dt/jq-3.7.0/dt-1.13.6/sl-1.7.0/datatables.min.css
import './libs/datatables.min.css';

export function Table({ data }) {
    const table = createElement('table', {});

    return table;
}
