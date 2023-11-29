const app = require('./server.js');
const { serveWS } = require('./webSocket.js');

const port = 4000;
server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

broadcast = serveWS(server);

const dayMillis = 1500;//1000 * 60 * 60 * 24;
setTimeout(async () => {
    const updates = await app.spotCheck();
    broadcast(updates);
}, dayMillis);
