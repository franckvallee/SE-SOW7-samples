package org.frva.custom.sow7.ei.zookeeper;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher.Event.KeeperState;
import org.apache.zookeeper.ZooKeeper;

/**
 * ZKConnection class used to connect and disconnect from a ZooKeeper Server
 * source: https://www.baeldung.com/java-zookeeper
 * @author frva
 */
class ZKConnection {
    private ZooKeeper zoo;
    CountDownLatch connectionLatch = new CountDownLatch(1);

    public ZooKeeper connect(String host, int port) throws IOException,InterruptedException {
        zoo = new ZooKeeper(host, port, (WatchedEvent we) -> {
            if (we.getState() == KeeperState.SyncConnected) {
                connectionLatch.countDown();
            }
        });
        connectionLatch.await();
        return zoo;
    }

    public void close() throws InterruptedException {
        zoo.close();
    }
}