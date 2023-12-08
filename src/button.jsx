import React from 'react';

export default function Button({ text, onClick, failState }) {
    const [failed, setFailed] = failState;
    if(failed) {
        setTimeout(() => setFailed(false), 2000);
    }

    return (
        <button
            className={ failed ? 'failed' : '' }
            type='button'
            onClick={ onClick }>

            { text }
        </button>
    );
}

