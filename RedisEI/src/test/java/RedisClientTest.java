
import org.frva.custom.sow7.ei.redis.RedisClientConnect;
import org.junit.Test;

/**
 *
 * @author frva
 */
public class RedisClientTest {
    
    @Test
    public void SetAndGet() {
        RedisClientConnect.initHost("redis://127.0.0.1:6379");
        System.out.println( "SET: " + RedisClientConnect.instance().set("HELLO", "hello world 2"));
        System.out.println( "GET: " + RedisClientConnect.instance().get("HELLO"));
    }
}
