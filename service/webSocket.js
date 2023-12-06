const { WebSocketServer } = require('ws');


function serveWS(server) {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    });


    let clients = [];

    wss.on('connection', (ws) => {
        const client = { id: clients.length + 1, alive: true, ws: ws };
        clients.push(client);

        //ws.send({ last_check: date })? or wait for message?

        ws.on('message', function message(data) {
            console.log(`Receiving unexpected data: ${data}`);
        });

        // Remove the closed connection so we don't try to forward anymore
        ws.on('close', () => {
            clients.findIndex((o, i) => {
                if (o.id === client.id) {
                    clients.splice(i, 1);
                    return true;
                }
            });
        });

        setInterval(() => {
            clients.forEach((c) => {
                // Kill any connection that didn't respond to the ping last time
                if (!c.alive) {
                    c.ws.terminate();
                } else {
                    c.alive = false;
                    c.ws.ping();
                }
            });
        }, 10000);

        // Respond to pong messages by marking the connection alive
        ws.on('pong', () => {
            client.alive = true;
        });
    });

    const broadcast = (data) => {
        clients.forEach((client) => {
            client.ws.send(data)
        });
    }

    return broadcast;
}

module.exports = { serveWS };
