/**
 * This is an example of how to create an event and send the corresponding STEP event 
 * at same time = Use Case B
 * - Bindings
 *      Node        current node
 *      Manager     current STEP manager
 *      Log         current Logger
 *      REDISGW     REST Gateway to REDIS REST Server
 *      PublishType Pubish derived Event Type
 *      REDISEP     Event processor for REDIS POC
 */
/* global Node, Manager, PublishType, REDISEvent, REDISEP, REDISGW */

// Current coordinates of the event data object
var contextID = (String)(Manager.getCurrentContext().getID());
var userID = (String)(Manager.getCurrentUser().getID());
var nodeID = (String)(Node.getID());
var eventTypeID = String(PublishType.getID());
var eventDataID = contextID + "|" + eventTypeID + "|" + nodeID;

// First check an event already exists:
var eventData = REDISEvent.getByID( REDISGW, eventDataID);
// add new event data
eventData.push({user:userID});
REDISEvent.upsert( REDISGW, eventDataID, eventData);

// Push the step event to the event processor
REDISEP.queueDerivedEvent( PublishType, Node);
