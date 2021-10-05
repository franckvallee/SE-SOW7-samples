/*
 * This example demonstrates how to read events from an Event processor per batch
 * - Bindings
 *      Batch       event batch to be processed
 *      Log         current Logger
 *      REDISGW     REST Gateway to REDIS
 *      GQLGW       REST GraphQL Gateway
 */
/* global Batch, REDISGW, REDISEvent, GRAPHQL, GQLGW, java, IO */
var OUTPUT_DIR = "/shared/exports/ProductSynchro2";

var batchIterator = Batch.getEvents().iterator();
while (batchIterator.hasNext()) {
    var event = batchIterator.next();
    var typeID = String(event.getEventType().getID());
    var nodeID = String(event.getNode().getID());
    // Retrieve event data from node id and event type
    var eventDataPool = REDISEvent.getEventData( REDISGW, nodeID, typeID);
    var gqlToken = GRAPHQL.getBearerToken( GQLGW);
    for ( var contextID in eventDataPool ) {
        // Query and extract data from GraphQL and node ID
        var gqlQuery = "query q_" + nodeID + " {\n" +
            "product( context: \"" + contextID + "\", workspace: \"Approved\", id: \"" + nodeID + "\") { \n" +
                "currentRevisionLastEdited \n" +
                "values {\n" +
                    "simpleValue\n" +
                "}\n" +
            "}\n" +
        "}\n";
        var productContent = GRAPHQL.invoke( GQLGW, "q_" + nodeID, gqlQuery, gqlToken);
        // attach specific event content to the returned data structure
        productContent.event = eventDataPool[contextID];
        // define the file path to create and create the file
        var extractPath = OUTPUT_DIR + "/" + java.lang.System.currentTimeMillis() 
                + "-" + contextID + "-" + nodeID + ".json";
        IO.writeFileContent( extractPath, JSON.stringify(productContent));
        // Delete the event data once consumed
        REDISEvent.deleteByID( REDISGW, contextID + "|" + typeID + "|" + nodeID);
    }
}

