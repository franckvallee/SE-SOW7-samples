/* 
 * Demonstration library for an Event Infrastructure hosted in REDIS through REST 
 */
/* global com */

function splitEventDataID( eventDataID) {
    var ids = eventDataID.split("|");
    return  { 
        contextID: ids[0],
        eventType: ids[1],
        nodeID: ids[2]
    };
}

function getByID( redisGW, eventDataID) {
    var ids = splitEventDataID( eventDataID);
    var query = redisGW.get();

    query.pathElements( "hmget", ids.eventType + "|" + ids.nodeID, ids.contextID);
    try {
        var value = String(query.invoke());
        if ( value === "[null]")
            return [];
        return JSON.parse(value);
    } catch (error) {
        if ( error.javaException instanceof com.stibo.gateway.rest.exception.RESTGatewayStatusCodeWithBodyException ) {
            return null;
        }
        throw error;
    }
}

function upsert( redisGW, eventDataID, eventData) {
    var ids = splitEventDataID( eventDataID);
    var query = redisGW.put();
    
    query.pathElements( "hmset", ids.eventType + "|" + ids.nodeID, ids.contextID);
    query.bodyContentType("application/json");
    query.body( eventData);
    try {
        query.invoke();
        return true;
    } catch (error) {
        if ( error.javaException instanceof com.stibo.gateway.rest.exception.RESTGatewayStatusCodeWithBodyException ) {
            return false;
        }
        throw error;
    }
}

function deleteByID( redisGW, eventDataID) {
    var ids = splitEventDataID( eventDataID);
    var query = redisGW.delete();
    
    query.pathElements( "hdel", ids.eventType + "|" + ids.nodeID, ids.contextID);
    query.invoke();
}

function getEventData( redisGW, nodeID, eventTypeID) {
    var query = redisGW.get();

    query.pathElements( "hgetall", eventTypeID + "|" + nodeID);
    try {
        var value = query.invoke();
        return ( value ? JSON.parse(value) : null );
    } catch (error) {
        if ( error.javaException instanceof com.stibo.gateway.rest.exception.RESTGatewayStatusCodeWithBodyException ) {
            return null;
        }
        throw error;
    }
}
