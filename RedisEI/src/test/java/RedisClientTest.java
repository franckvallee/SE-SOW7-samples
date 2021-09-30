
import io.lettuce.core.api.sync.RedisCommands;
import static org.frva.custom.sow7.ei.redis.RedisClientConnect.getClientSyncConnection;
import org.junit.Test;

/**
 *
 * @author frva
 */
public class RedisClientTest {
    
    @Test
    public void SetAndGet() {
        RedisCommands<String, String> conn = getClientSyncConnection();
        System.out.println( "SET: " + conn.set("HELLO", "hello world"));
        System.out.println( "GET: " + conn.get("HELLO"));
    }
}
