/* 
 * Demonstration library for an Event Infrastructure hosted in Elasticsearch 
 */
/* global com */

var INDEX = "frva0001";
var DOCTYPE = "event";

function getByID( esGW, eventDataID) {
    var query = esGW.get();

    query.pathElements( INDEX, DOCTYPE, eventDataID);
    try {
        var esResponse = JSON.parse(query.invoke());
    } catch (error) {
        if ( error.javaException instanceof com.stibo.gateway.rest.exception.RESTGatewayStatusCodeWithBodyException ) {
            return null;
        }
    }
    if ( esResponse.found === true ) {
        return esResponse._source;
    } else {
        return null;
    }
}

function upsert( esGW, eventDataID, eventData) {
    var query = esGW.put();
    
    query.pathElements( INDEX, DOCTYPE, eventDataID);
    query.bodyContentType("application/json");
    query.body( JSON.stringify(eventData));
    var esResponse = JSON.parse(query.invoke());
    if ( esResponse.error ) {
        throw esResponse.error.caused_by.reason;
    }
}

function deleteByID( esGW, eventDataID) {
    var query = esGW.delete();
    
    query.pathElements( INDEX, DOCTYPE, eventDataID);
    query.invoke();
}

function getEventData( esGW, nodeID, eventTypeID) {
    var query = esGW.post();
    var esQueryBody = {
        query: {
            bool: {
                must: [
                    { match: { source: nodeID } },
                    { match: { type: eventTypeID } }
                ]
            }
        }
    };
    query.pathElements( INDEX, DOCTYPE, "_search");
    query.bodyContentType("application/json");
    query.body( JSON.stringify(esQueryBody));
    var esResponse = JSON.parse(query.invoke());
    var eventData = [];
    if ( esResponse.hits && esResponse.hits.total.value > 0 ) {
        for each ( var hit in esResponse.hits.hits ) {
            eventData.push( hit._source);
        }
    }
    return eventData;
}
