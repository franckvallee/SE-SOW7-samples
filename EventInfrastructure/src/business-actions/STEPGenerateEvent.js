/**
 * This is an example of what can be run from a Generate Event Business Action
 * - the business action is declared in the trigger tab of event processor or event-based OIEP
 * - Bindings
 *      Node        current node
 *      Manager     current STEP manager
 *      Log         current Logger
 *      EventInfrastructure root node to event data hierarchy
 *      EventType   current event type
 */
/* global Node, Manager, EventType, EventInfrastructure, EZTree */

// Current coordinates of the event data object
var contextID = (String)(Manager.getCurrentContext().getID());
var userID = (String)(Manager.getCurrentUser().getID());
var nodeID = (String)(Node.getID());
var eventTypeID = String(EventType.getID());

// Prepare the hierarchy structure to create or retrieve the event data
var objectTypeID = contextID + "|" + Node.getObjectType().getID();
var categoryID = contextID + "|" + Node.getParent().getParent().getID();
var familyID = contextID + "|" + Node.getParent().getID();
var eventTypeLevel = familyID + "|" + eventTypeID;
var eventDataID = contextID + "|" + eventTypeID + "|" + nodeID;
var eventDataHierarchy = [
    {"id": contextID, "name": contextID, typeID:"EventContextLevel"},
    {"id": objectTypeID, "name": objectTypeID, typeID:"ObjectTypeLevel"},
    {"id": categoryID, "name": categoryID, typeID:"ObjectCategoryLevel"},
    {"id": familyID, "name": familyID, typeID:"ObjectFamilyLevel"},
    {"id": eventTypeLevel, "name": eventTypeLevel, typeID:"EventTypeLevel"},
    {"id": eventDataID, "name": eventDataID, typeID:"EventData"}
];

// Create or update the event data node
var eventDataNode = EZTree.createBranchOfChildren( EventInfrastructure, eventDataHierarchy);
eventDataNode.getValue("EventSourceNodeID").setSimpleValue(nodeID);
eventDataNode.getValue("EventSourceTypeID").setSimpleValue(eventTypeID);
var curEventData = eventDataNode.getValue("EventData").getSimpleValue();
curEventData = curEventData ? JSON.parse(curEventData) : [];
curEventData.push( {"user": userID});
eventDataNode.getValue("EventData").setSimpleValue( JSON.stringify(curEventData));

