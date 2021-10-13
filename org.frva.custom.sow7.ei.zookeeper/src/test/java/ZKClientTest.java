
import com.stibo.core.domain.businessrule.plugin.BusinessRulePluginException;
import java.io.IOException;
import org.apache.zookeeper.KeeperException;
import org.frva.custom.sow7.ei.zookeeper.ZKClient;
import org.junit.Test;

/**
 *
 * @author frva
 */
public class ZKClientTest {
    
    @Test
    public void createSetAndGet() throws IOException, InterruptedException, KeeperException, BusinessRulePluginException {
        ZKClient.initHost( "127.0.0.1", 2181);
        ZKClient.instance().create( "/MyNode", "");
        if ( !ZKClient.instance().exists( "/MyNode/GL") ) {
            System.out.println( "Creating new event data for GL");
            ZKClient.instance().create( "/MyNode/GL", "{\"version\":1}");
        }
        if ( !ZKClient.instance().exists( "/MyNode/en_US") ) {
            System.out.println( "Creating new event data for en_US");
            ZKClient.instance().create( "/MyNode/en_US", "{\"version\":1}");
        }
        String children = ZKClient.instance().list("/MyNode");
        System.out.println( "children are: " + children);
        String enUSContent = ZKClient.instance().get("/MyNode/en_US");
        System.out.println( "en_US = " + enUSContent);
        // update the content
        ZKClient.instance().set("/MyNode/en_US", enUSContent + ",{\"extended\":true}");
        enUSContent = ZKClient.instance().get("/MyNode/en_US");
        System.out.println( "en_US(2) = " + enUSContent);
        ZKClient.instance().delete("/MyNode/en_US");
        children = ZKClient.instance().list("/MyNode");
        System.out.println( "remaning child: " + children);
        //ZKClient.instance().delete("/MyNode"); -- cannot delete with remainig children
    }
    
}
