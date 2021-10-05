/**
 * This is an example of how to generate event from an event processor
 * at same time = Use Case B
 * - Bindings
 *      Node        current node
 *      Manager     current STEP manager
 *      Log         current Logger
 *      REDISGW     REST Gateway to REDIS
 *      EventType   current event type
 */
/* global Node, Manager, EventType, REDISEvent, REDISGW */

// Current coordinates of the event data object
var contextID = (String)(Manager.getCurrentContext().getID());
var userID = (String)(Manager.getCurrentUser().getID());
var nodeID = (String)(Node.getID());
var eventTypeID = String(EventType.getID());
var eventDataID = contextID + "|" + eventTypeID + "|" + nodeID;

// First check an event already exists (returns empty if not existing)
var eventData = REDISEvent.getByID( REDISGW, eventDataID);
eventData.push({user:userID});
REDISEvent.upsert( REDISGW, eventDataID, eventData);
