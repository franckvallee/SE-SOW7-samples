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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.redisson.api.RedissonClient;

/**
 * A business function to call REDIS
 * @author frva
 */
@Plugin(id = "org.frva.custom.sow7.ei.redis.RedisClient")
@PluginName("REDIS Client")
@PluginDescription("A business function to read/write from a REDIS server")
public class RedisClientFunction implements 
        BusinessFunctionPlugin<RedisClientFunction.Parameters, RedisClientFunction.Context, String> {
    
    // Function parameters
    private String command;
    private List<String> cmdParams;
    // Handler on the REDIS client
    RedissonClient redisCli;
    
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
        // Only the subset of used commands are implemented there:
        switch( command.toUpperCase() ) {
            case "SET": return rSet();
            case "GET": return rGet();
            case "EXISTS": return rExists();
            case "HMSET": return rHMSet();
            case "HKEYS": return rHKeys();
            case "HMGET": return rHMGet();
            case "HDEL": return rHDel();
        }
        // When the command is not implemented
        throw new BusinessRulePluginException( 
                String.format( "REDIS Command not implemented:%s - (%s)", 
                command, cmdParams.stream().collect(Collectors.joining())));
    }

    private String rSet() throws BusinessRulePluginException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS SET (%s) - parameters missing (requires at least Key and Value)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        return RedisClientConnect.instance().set( cmdParams.get(0), cmdParams.get(1));
    }
    
    private String rGet() throws BusinessRulePluginException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "REDIS GET - Key parameter is missing");
        }
        return RedisClientConnect.instance().get( cmdParams.get(0));
    }
    
    private String rExists() throws BusinessRulePluginException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "REDIS EXISTS - Key parameter is missing");
        }
        return RedisClientConnect.instance().exists( cmdParams.get(0));
    }
    
    private String rHMSet() throws BusinessRulePluginException {
        if ( cmdParams.size() < 3 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS HMSET (%s) - parameters missing (requires at least Key, Hashkey and Value)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        Map<String,String> hmKeyValues = new HashMap<>();
        for (int i = 1; i < cmdParams.size()-1; i += 2 ) {
            hmKeyValues.put(cmdParams.get(i), cmdParams.get(i+1));
        }
        return RedisClientConnect.instance().hmset( cmdParams.get(0), hmKeyValues);
    }
    
    private String rHKeys() throws BusinessRulePluginException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "REDIS HKEYS - Key parameter is missing");
        }
        List<String> keys = RedisClientConnect.instance().hkeys(cmdParams.get(0));
        // Return the JSON representation of keys
        try {
            return (new ObjectMapper()).writeValueAsString(keys);
        } catch (JsonProcessingException ex) {
            throw new BusinessRulePluginException( "JSON serialization error", ex);
        }
    }
    
    private String rHMGet() throws BusinessRulePluginException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS HMGET (%s) - parameters missing (requires at least Key and Subkey)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        String[] subKeys = new String[cmdParams.size()-1];
        for ( int i = 1; i < cmdParams.size(); i++ ) {
            subKeys[i-1] = cmdParams.get(i);
        }
        Map<String,String> keyValues = RedisClientConnect.instance().hmget(cmdParams.get(0),subKeys);
        // Return the JSON representation of the map
        try {
            return (new ObjectMapper()).writeValueAsString(keyValues);
        } catch (JsonProcessingException ex) {
            throw new BusinessRulePluginException( "JSON serialization error", ex);
        }
    }
    
    private String rHDel() throws BusinessRulePluginException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "REDIS HDEL (%s) - parameters missing (requires at least Key and Subkey)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        String[] subKeys = new String[cmdParams.size()-1];
        for ( int i = 1; i < cmdParams.size(); i++ ) {
            subKeys[i-1] = cmdParams.get(i);
        }
        return RedisClientConnect.instance().hdel( cmdParams.get(0), subKeys);
    }
    
}
