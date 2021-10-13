package org.frva.custom.sow7.ei.zookeeper;

import com.stibo.core.domain.businessrule.plugin.BusinessRulePluginException;
import com.stibo.core.domain.businessrule.plugin.function.BusinessFunctionPlugin;
import com.stibo.framework.Plugin;
import com.stibo.framework.PluginDescription;
import com.stibo.framework.PluginName;
import com.stibo.framework.PluginParameter;
import com.stibo.framework.Required;
import com.stibo.framework.SoftRequired;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.zookeeper.KeeperException;

/**
 * A business function to call Zookeeper
 * @author frva
 */
@Plugin(id = "org.frva.custom.sow7.ei.zookeeper.ZKClient")
@PluginName("Zookeeper Client")
@PluginDescription("A business function to read/write from a ZK server")
public class ZKClientFunction implements 
        BusinessFunctionPlugin<ZKClientFunction.Parameters, ZKClientFunction.Context, String> {
    
    // Function parameters
    private String command;
    private List<String> cmdParams;
    
    @Override
    public Object getDescription() {
        return "A business function to read/write from Zookeeper";
    }
    
    public interface Parameters {
        @Required
        @PluginParameter(name = "Command", description = "ZK Command (e.g. create)", priority = 100)
        String getCommand();
        
        @SoftRequired
        @PluginParameter(name = "Command parameters", description = "ZK Command parameters (e.g. {\"Hello\",\"hello world\"})", priority = 200)
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
        try {
            switch( command.toUpperCase() ) {
                case "SET": return zkSet();
                case "GET": return zkGet();
                case "EXISTS": return zkExists();
                case "CREATE": return zkCreate();
                case "DELETE": return zkDelete();
                case "LIST": return zkList();
            }
        } catch ( IOException | InterruptedException | KeeperException zkEx) {
            throw new BusinessRulePluginException( "Zookeeper Layer exception", zkEx);
        } catch ( Exception rtEx) {
            throw new BusinessRulePluginException( "Zookeeper sever exception", rtEx);
        }
        // When the command is not implemented
        throw new BusinessRulePluginException( 
                String.format( "Zookeeper Command not implemented:%s - (%s)", 
                command, cmdParams.stream().collect(Collectors.joining())));
    }

    private String zkSet()
            throws BusinessRulePluginException, IOException, InterruptedException, KeeperException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "set (%s) - parameters missing (requires path and content)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        ZKClient.instance().set( cmdParams.get(0), cmdParams.get(1));
        return "OK";
    }
    
    private String zkGet()
            throws BusinessRulePluginException, IOException, InterruptedException, KeeperException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "get - path parameter is missing");
        }
        return ZKClient.instance().get( cmdParams.get(0));
    }
    
    private String zkExists() 
            throws BusinessRulePluginException, IOException, InterruptedException, KeeperException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "exists - path parameter is missing");
        }
        return Boolean.toString( ZKClient.instance().exists( cmdParams.get(0)));
    }
    
    private String zkCreate() 
            throws BusinessRulePluginException, IOException, InterruptedException, KeeperException {
        if ( cmdParams.size() < 2 ) {
            throw new BusinessRulePluginException( 
                String.format( "create (%s) - parameters missing (requires path and content)", 
                command, cmdParams.stream().collect(Collectors.joining())));
        }
        ZKClient.instance().create( cmdParams.get(0), cmdParams.get(1));
        return "OK";
    }
    
    private String zkDelete() 
            throws BusinessRulePluginException, IOException, InterruptedException, KeeperException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "delete - path parameter is missing");
        }
        ZKClient.instance().delete( cmdParams.get(0));
        return "OK";
    }
    
    private String zkList() 
            throws BusinessRulePluginException, IOException, InterruptedException, KeeperException {
        if ( cmdParams.isEmpty() ) {
            throw new BusinessRulePluginException( 
                "list - path parameter is missing");
        }
        return ZKClient.instance().list( cmdParams.get(0));
    }
}

