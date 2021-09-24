/**
 * This is an example of how to create an event and send the corresponding STEP event 
 * at same time = Use Case B
 * - Bindings
 *      Node        current node
 *      Manager     current STEP manager
 *      Log         current Logger
 *      ESGW        REST Gateway to Elasticsearch
 *      PublishType Pubish derived Event Type
 *      ESEP        Event processor for ES POC
 */
/* global Node, Manager, PublishType, ESEvent, ESEP, ESGW */

// Current coordinates of the event data object
var contextID = (String)(Manager.getCurrentContext().getID());
var userID = (String)(Manager.getCurrentUser().getID());
var nodeID = (String)(Node.getID());
var eventTypeID = String(PublishType.getID());
var eventDataID = contextID + "|" + eventTypeID + "|" + nodeID;

// First check an event already exists:
var eventData = ESEvent.getByID( ESGW, eventDataID);
if ( !eventData ) { // Case of event data creation
    eventData = {
        source: nodeID,
        type: eventTypeID,
        context: contextID,
        data: [{user:userID}]
    };
} else { // Case of event data update
    eventData.data.push({user:userID});
}
ESEvent.upsert( ESGW, eventDataID, eventData);

// Push the step event to the event processor
ESEP.queueDerivedEvent( PublishType, Node);
