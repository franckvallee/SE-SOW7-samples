/* 
 * Express / REDIS REST server
 */
/* global process */

// express setup
const REDIS_REST_PORT = 3000;
const express = require('express');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// redis setup
const REDIS_CONNECTION_STRING = "redis://127.0.0.1:6379";
const Redis = require('redis');
const RedisCli = Redis.createClient(REDIS_CONNECTION_STRING);
RedisCli.on('connect', function() {
    console.log('Connected to REDIS');
});
RedisCli.on('error', function(err) {
    console.log('/!\ REDIS ERROR: ' + err);
});
process.on('exit', function () {
    RedisCli.quit();
});

//// enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// GET .../get/KEY 
app.get('/get/:key', function(req, res) {
    RedisCli.get( req.params.key, function (err, result) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(result);
        }    
    });
});

// PUT .../set/KEY + body 
app.put('/set/:key', function(req, res) {
    var value = JSON.stringify(req.body);
    console.log("SET " + req.params.key + " " + value);
    RedisCli.set( req.params.key, value,
        function (err, result) { 
            if (err) {
                console.log('SET ERROR: ' + err);
                res.status(500).send(err);
            } else {
                res.send(result);
            }    
    });
});

// GET .../exists/KEY 
app.get('/exists/:key', function(req, res) {
    RedisCli.exists( req.params.key, function (err, result) {
        if (err) {
            console.log('EXISTS ERROR: ' + err);
            res.status(500).send(err);
        } else {
            res.send( result ? "true" : "false" );
        }    
    });
});

//PUT .../hmset/KEY/subKey + JSON body
app.put('/hmset/:key/:subkey', function(req, res) {
    var value = JSON.stringify(req.body);
    console.log("HMSET " + req.params.key + " " + req.params.subkey + " " + value);
    RedisCli.hmset( req.params.key, req.params.subkey, value,
        function (err, result) { 
            if (err) {
                console.log('HMSET ERROR: ' + err);
                res.status(500).send(err);
            } else {
                res.send(result);
            }
    });
});

// GET .../hkeys/KEY 
app.get('/hkeys/:key', function(req, res) {
    RedisCli.hkeys( req.params.key, function (err, result) {
        if (err) {
            console.log('HKEYS ERROR: ' + err);
            res.status(500).send(err);
        } else {
            res.send(result);
        }    
    });
});

// GET .../hmget/KEY/subKey 
app.get('/hmget/:key/:subkey', function(req, res) {
    RedisCli.hmget( req.params.key, req.params.subkey, function (err, result) {
        if (err) {
            console.log('HMGET ERROR: ' + err);
            res.status(500).send(err);
        } else {
            res.send(result);
        }    
    });
});

// DELETE .../hdel/KEY/subKey 
app.delete('/hdel/:key/:subkey', function(req, res) {
    console.log("HDEL " + req.params.key + " " + req.params.subkey);
    RedisCli.hdel( req.params.key, req.params.subkey, function (err, result) {
        if (err) {
            console.log('DELETE ERROR: ' + err);
            res.sendStatus(500);
        } else {
            res.send();
        }    
    });
});

// Start REST server
app.listen(REDIS_REST_PORT, () =>
    console.log('Listening on port '+ REDIS_REST_PORT + '...')); 
