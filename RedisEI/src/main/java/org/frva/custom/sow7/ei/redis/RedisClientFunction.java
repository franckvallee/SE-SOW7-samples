package org.frva.custom.sow7.ei.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stibo.core.domain.businessrule.plugin.BusinessRulePluginException;
import com.stibo.core.domain.businessrule.plugin.function.BusinessFunctionPlugin;
import com.stibo.framework.Plugin;
import com.stibo.framework.PluginDescription;
import com.stibo.framework.PluginName;
import com.stibo.framework.PluginParameter;
import com.stibo.framework.Required;
import com.stibo.framework.SoftRequired;
import io.lettuce.core.KeyValue;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * A business function to call REDIS
 * @author frva
 */
@Plugin(id = "org.frva.custom.sow7.ei.redis.RedisClient")
@PluginName("REDIS Client")
@PluginDescription("A business function to read/write from a REDIS server")
public class RedisClientFunction implements 
        BusinessFunctionPlugin<RedisClientFunction.Parameters, RedisClientFunction.Context, String> {
    
    // Maintain REDIS connection live in memory - to be later adapted with:
    //  - an external configuration file that defines the connection string
    //  - maintain the connection open or reopen the connection at every call...
    private static final String REDIS_CONNECTION_STRING = "redis://FRVAWIN10:6379/";
    private static RedisClient redisCli;
    private static StatefulRedisConnection<String, String> redisCliConnection;
    
    // connection management with lazy initialization approach
    private static RedisCommands<String, String> getClientSyncConnection() {
        // Lazy implementation of REDIS client
        if ( redisCli == null ) {
            redisCli = RedisClient.create(REDIS_CONNECTION_STRING);
        }
        if ( redisCliConnection == null || !redisCliConnection.isOpen() ) {
            redisCliConnection = redisCli.connect();
        }
        return redisCliConnection.sync();
    }
    
    // Function parameters
    private String command;
    private List<String> cmdParams;
    
    @Override
    public Object getDescription() {
        return "A business function to read/write from REDIS";
    }
    
    public interface Parameters {
        @Required
        @PluginParameter(name = "Command", description = "REDIS Command (e.g. SET)", priority = 100)
        String getCommand();
        
        @SoftRequired
        @PluginParameter(name = "Command parameters", description = "REDIS Command parameters (e.g. {\"Hello\",\"hello world\"})", priority = 200)
        List<String> getParameters();
        
    }
   
    public interface Context {
        // possible binds to the logger, the Manager or config objects go here (no need for now)
    }
    
    @Override
    public void initFromConfiguration(Parameters parameters) {
        command = parameters.getCommand();
        cmdParams = parameters.getParameters() == null ? new ArrayList<>() : parameters.getParameters();
    }
    
    @Override
    public String evaluate(Context context) throws BusinessRulePluginException {
        RedisCommands<String, String> syncCommands = getClientSyncConnection();
        // Only the subset of used commands are implemented there:
        switch( command.toUpperCase() ) {
            case "SET": return rSet(syncCommands);
            case "GET": return rGet(syncCommands);
            case "EXISTS": return rExists(syncCommands);
            case "HMSET": return rHMSet(syncCommands);
            case "HKEYS": return rHKeys(syncCommands);
            case "HMGET": return rHMGet(syncCommands);
            case "HDEL": return rHDel(syncCommands);
        }
        // When the command is not implemented
        throw new BusinessRulePluginException( 
                String.format( "REDIS Command not implemented:%s - (%s)", 
                command, cmdParams.stream().collect(Collectors.joining())));
    }

    private String rSet(RedisCommands<String, String> syncCommands) throws BusinessRulePluginException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS SET (%s) - parameters missing (requires at least Key and Value)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        return syncCommands.set( cmdParams.get(0), cmdParams.get(1));
    }
    
    private String rGet(RedisCommands<String, String> syncCommands) throws BusinessRulePluginException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "REDIS GET - Key parameter is missing");
        }
        return syncCommands.get( cmdParams.get(0));
    }
    
    private String rExists(RedisCommands<String, String> syncCommands) throws BusinessRulePluginException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "REDIS EXISTS - Key parameter is missing");
        }
        return syncCommands.exists( cmdParams.get(0)) >= 1 ? "true" : "false";
    }
    
    private String rHMSet(RedisCommands<String, String> syncCommands) throws BusinessRulePluginException {
        if ( cmdParams.size() < 3 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS HMSET (%s) - parameters missing (requires at least Key, Hashkey and Value)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        Map<String,String> hmKeyValues = new HashMap<>();
        for (int i = 1; i < cmdParams.size()-1; i += 2 ) {
            hmKeyValues.put(cmdParams.get(i), cmdParams.get(i+1));
        }
        return syncCommands.hmset( cmdParams.get(0), hmKeyValues);
    }
    
    private String rHKeys(RedisCommands<String, String> syncCommands) throws BusinessRulePluginException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "REDIS HKEYS - Key parameter is missing");
        }
        List<String> keys = syncCommands.hkeys(cmdParams.get(0));
        // Return the JSON representation of keys
        try {
            return (new ObjectMapper()).writeValueAsString(keys);
        } catch (JsonProcessingException ex) {
            throw new BusinessRulePluginException( "JSON serialization error", ex);
        }
    }
    
    private String rHMGet(RedisCommands<String, String> syncCommands) throws BusinessRulePluginException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS HMGET (%s) - parameters missing (requires at least Key and Subkey)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        String[] subKeys = new String[cmdParams.size()-1];
        for ( int i = 1; i < cmdParams.size(); i++ ) {
            subKeys[i-1] = cmdParams.get(i);
        }
        List<KeyValue<String,String>> values = syncCommands.hmget(cmdParams.get(0),subKeys);
        Map<String,String> keyValues = values.stream()
                .collect( Collectors.toMap( kv -> kv.getKey(), kv -> kv.getValue()));
        // Return the JSON representation of the map
        try {
            return (new ObjectMapper()).writeValueAsString(keyValues);
        } catch (JsonProcessingException ex) {
            throw new BusinessRulePluginException( "JSON serialization error", ex);
        }
    }
    
    private String rHDel(RedisCommands<String, String> syncCommands) throws BusinessRulePluginException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS HDEL (%s) - parameters missing (requires at least Key and Subkey)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        String[] subKeys = new String[cmdParams.size()-1];
        for ( int i = 1; i < cmdParams.size(); i++ ) {
            subKeys[i-1] = cmdParams.get(i);
        }
        return syncCommands.hdel( cmdParams.get(0), subKeys) >= 1 ? "true" : "false";
    }
    
}
