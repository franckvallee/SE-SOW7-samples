package org.frva.custom.sow7.ei.redis;

import java.util.List;
import java.util.Map;
import org.redisson.Redisson;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;


/**
 * isolate the pure REDIS connection independently from STEP environment
 * @author frva
 */
public class RedisClientConnect {
    
    // Maintain REDIS connection live in memory - to be later adapted with:
    //  - an external configuration file that defines the connection string
    private static String connectionString = "redis://FRVAWIN10:6379";
    private static RedisClientConnect instance;
    private final RedissonClient redisCli;
    
    private RedisClientConnect() {
        // Lazy implementation of REDIS client
        Config config = new Config();
        config.useSingleServer().setAddress(connectionString);
        redisCli = Redisson.create(config);
    }
    
    public static void initHost( String hostAndPort) {
        connectionString = hostAndPort;
    }
    
    // Singleton with lazy initialization
    public static RedisClientConnect  instance() {
        if ( instance == null ) {
            instance = new RedisClientConnect();
        }
        return instance;
    }
    
    public String get( String key) {
        RBucket<String> rValue = redisCli.getBucket(key);
        return rValue.get();
    }
    
    public String set( String key, String value) {
        RBucket<String> rValue = redisCli.getBucket(key);
        rValue.set(value);
        return rValue.get();
    }
    
    public String exists( String key) {
        RBucket<String> rValue = redisCli.getBucket(key);
        return rValue.get();
    }

    String hmset(String get, Map<String, String> hmKeyValues) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    List<String> hkeys(String get) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    Map<String, String> hmget(String get, String[] subKeys) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    String hdel(String get, String[] subKeys) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    
}
