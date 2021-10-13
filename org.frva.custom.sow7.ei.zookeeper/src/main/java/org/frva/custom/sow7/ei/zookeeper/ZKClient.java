package org.frva.custom.sow7.ei.zookeeper;

import com.stibo.core.domain.businessrule.plugin.BusinessRulePluginException;
import java.io.IOException;
import java.util.stream.Collectors;
import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.KeeperException;
import org.apache.zookeeper.ZooDefs;
import org.apache.zookeeper.ZooKeeper;
import org.apache.zookeeper.data.Stat;
import org.slf4j.LoggerFactory;

/**
 * isolate the pure ZK client code independently from STEP environment
 * @author frva
 */
public class ZKClient {
    // Maintain ZK connection live in memory - to be later adapted with:
    //  - an external configuration file that defines the connection string
    private static String zkHost = "FRVAWIN10";
    private static int zkPort = 2181; 
    private static ZKClient instance;
    private final ZooKeeper zk;
    
    private ZKClient() throws IOException, InterruptedException {
        // Lazy implementation of the logger
        ConsoleAppender console = new ConsoleAppender();
        console.setThreshold(Level.FATAL);
        Logger.getRootLogger().addAppender(console);
        // source of RuntimeException: java.lang.NoClassDefFoundError: org/slf4j/LoggerFactory
        // LoggerFactory.getLogger(ZKClient.class.getName()).trace("start ZK initialization");
        // Lazy implementation of ZK client connection
        ZKConnection zkCon = new ZKConnection();
        zk = zkCon.connect(zkHost, zkPort);
    }
    
    public static void initHost( String host, int port) {
        zkHost = host;
        zkPort = port;
    }
    
    // Singleton with lazy initialization
    public static ZKClient  instance() throws IOException, InterruptedException {
        if ( instance == null ) {
            instance = new ZKClient();
        }
        return instance;
    }
    
    public boolean exists( String path) throws KeeperException, InterruptedException {
        Stat stat = zk.exists(path, false);
        return (stat != null);
    }
    
    public void create( String path, String content) throws KeeperException, InterruptedException {
        Stat stat = zk.exists(path, false);
        if ( stat != null )
            return;
        zk.create(path, content.getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
    }
    
    
    public void set( String path, String content) throws KeeperException, InterruptedException, BusinessRulePluginException {
        Stat stat = zk.exists(path, false);
        if ( stat == null ) {
            throw new BusinessRulePluginException( "ZNode " + path + " doesn't exist");
        }
        zk.setData(path, content.getBytes(), stat.getVersion());
    }
    
    public String get( String path) throws KeeperException, InterruptedException {
        byte[] content = zk.getData(path, false, new Stat());
        return new String(content);
    }
    
    public void delete( String path) throws KeeperException, InterruptedException {
        Stat stat = zk.exists(path, false);
        if ( stat == null ) {
            return;
        }
        zk.delete(path, stat.getVersion());
    }
    
    public String list( String path) throws KeeperException, InterruptedException {
        return zk.getChildren(path, false)
                .stream().collect(Collectors.joining(";"));
    }
}
