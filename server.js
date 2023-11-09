const express = require('express');
const app = express();

app.use(express.json());

app.use(express.static('public'));

const apiRouter = express.Router({ caseSensitive: true });
app.use('/api', apiRouter);

const logReq = (req, res) => {
    console.log(`[${req.method}] ${req.params.endpoint}`);
    console.log(req.get('Authorization'));
    console.log(req.body);
    res.send({ success: true });
};

apiRouter.get('/:endpoint', logReq);
apiRouter.put('/:endpoint', logReq);
apiRouter.post('/:endpoint', logReq);
apiRouter.delete('/:endpoint', logReq);

module.exports = app;
