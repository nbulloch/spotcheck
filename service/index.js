const app = require('./server.js');
const { serveWS } = require('./webSocket.js');

const port = 4000;
server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

broadcast = serveWS(server);

const dayMillis = 1000 * 60 * 60 * 24;
setInterval(async () => {
    broadcast(JSON.stringify({ msg: 'Executing SpotCheck' }));

    const updates = await app.spotCheck();
    broadcast(updates);
}, dayMillis);
