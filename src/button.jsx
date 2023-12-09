import React from 'react';

export default function Button({ text, onClick }) {
    const [failed, setFailed] = React.useState(false);

    const clicked = async () => {
        const success = await onClick();
        if(!success) {
            setFailed(true);
            setTimeout(() => setFailed(false), 2000);
        }
    }

    return (
        <button
            className={ failed ? 'failed' : '' }
            type='button'
            onClick={ clicked }>

            { text }
        </button>
    );
}

