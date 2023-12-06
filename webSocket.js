const socket = new WebSocket('ws://' + window.location.host + '/ws');

socket.onopen = (event) => {
    console.log('Connected to websocket');
};

socket.onmessage = async (event) => {
    const text = await event.data.text();
    console.log(JSON.parse(text));
};

socket.onclose = (event) => {
    console.log('Disconnected from websocket');
};
