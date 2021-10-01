const REDIS_CONNECTION_STRING = "redis://127.0.0.1:6379";
const Redis = require('redis');
const RedisCli = Redis.createClient(REDIS_CONNECTION_STRING);
RedisCli.on('connect', function () {
    console.log('Connected to REDIS');
});
RedisCli.on('error', function (err) {
    console.log('/!\ REDIS ERROR: ' + err);
});

RedisCli.set( "FVALUE", "test_" + (Math.floor(Math.random() * 100)),
        function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("run by callback: " + result);
                RedisCli.get("FVALUE", function (err, result) { console.log("control: " + result);});
            }
});


const { promisifyAll } = require('bluebird');
promisifyAll(Redis);
const runAsync = async () => {
    // Connect to redis again
    const RedisCli2 = Redis.createClient(REDIS_CONNECTION_STRING);
    await RedisCli2.setAsync( "FVALUE2", "test_" + (Math.floor(Math.random() * 100)));
    const value = await RedisCli2.getAsync("FVALUE2");
    console.log( "async control: " + value);
};
runAsync();
