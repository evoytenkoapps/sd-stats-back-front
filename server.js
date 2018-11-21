const fs = require('fs');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const environment = require('./environment.js');
const api = require('./routes/api/api');
const host = environment.host;
const port = environment.port;
const db_helper = require('./db/db_helper');

app.use(bodyParser.json({
    limit: 100000000
}));

app.use('/api', api);

app.use(express.static('./html'));

app.get(/./, (req, res) => {
    console.log(req.path);
    res.sendFile(__dirname + '/html/index.html')
});


server.listen(port, host, function () {
    console.log('Node server started on %s:%d', host, port);
});