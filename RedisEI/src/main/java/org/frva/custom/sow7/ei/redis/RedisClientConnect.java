package org.frva.custom.sow7.ei.redis;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;

/**
 * isolate the pure REDIS connection independently from STEP environment
 * @author frva
 */
public class RedisClientConnect {
    
    // Maintain REDIS connection live in memory - to be later adapted with:
    //  - an external configuration file that defines the connection string
    //  - maintain the connection open or reopen the connection at every call...
    private static final String REDIS_CONNECTION_STRING = "redis://FRVAWIN10:6379/";
    private static RedisClient redisCli;
    private static StatefulRedisConnection<String, String> redisCliConnection;
    
    public static RedisClient getClient() {
        // Lazy implementation of REDIS client
        if ( redisCli == null ) {
            redisCli = RedisClient.create(REDIS_CONNECTION_STRING);
        }
        return redisCli;
    }
    
    // connection management with lazy initialization approach
    public static RedisCommands<String, String> getClientSyncConnection() {
        getClient(); // ensure lazy initialization of the client
        if ( redisCliConnection == null || !redisCliConnection.isOpen() ) {
            redisCliConnection = redisCli.connect();
        }
        return redisCliConnection.sync();
    }
    
}
