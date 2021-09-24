/* 
 * This is an example of a JSON Node Handler for Message-Based OIEP
 * that takes additional information from the Event Infrastructure
 * Bindings:
 *      Log = Logger
 *      NodeHandlerSource = Node Handler Source
 *      NodeHandlerResult = Node Handler Result
 *      ExecutionReportLogger = Execution Report Logger
 *      EventSourceTypeIDAttr = Attribute EventSourceTypeID
 *      EventSourceNodeIDAttr = Attribute EventSourceNodeID
 *      GQLGateway = Gateway to the reflexive GraphQL API
 */
/* global NodeHandlerSource, com, EventSourceTypeIDAttr, EventSourceNodeIDAttr, GRAPHQL, GQLGateway, NodeHandlerResult, ExecutionReportLogger */

// Retrieve the event data from Node information
// Important: "colate nodes" is set to No
var eventTypeID = null;
if ( !NodeHandlerSource.getSimpleEventType() ) {
    // do nothing;
} else {
    eventTypeID = String(NodeHandlerSource.getSimpleEventType().getID());
}

var nodeID = NodeHandlerSource.getNode() ? String(NodeHandlerSource.getNode().getID()) : null;
var eventDataPool = []; // The pool of pending event data
if ( eventTypeID && nodeID ) {
    var QC = com.stibo.query.condition.Conditions;
    var queryHome = NodeHandlerSource.getNode().getManager().getHome(com.stibo.query.home.QueryHome);
    var querySpecification = queryHome.queryFor(com.stibo.core.domain.entity.Entity)
        .where(
            QC.valueOf(EventSourceTypeIDAttr).eq(eventTypeID).and(
            QC.valueOf(EventSourceNodeIDAttr).eq(nodeID) )
        );
    querySpecification.execute().forEach( function(data) {
        var eventDataContent = data.getValue("EventData").getSimpleValue();
        if ( eventDataContent && !eventDataContent.equals("[]")) {
            eventDataPool.push(data);
        }
        return true;
    });
    ExecutionReportLogger.logInfo( "Exporting node " + nodeID + " from " 
            + eventDataPool.length + " found event data");
}

// Discard delete or purge information for this POC
if ( !eventTypeID || !nodeID || NodeHandlerSource.isDeleted() || NodeHandlerSource.isPurged() ) {
    ; // Do nothing
} 
// Use event data information to extract what is required to export in the right context
// Extraction is using a GRAPHQL reflexive Gateway call
else if ( nodeID ) {
    var gqlToken = GRAPHQL.getBearerToken( GQLGateway);
    for each ( var eventData in eventDataPool ) {
        var contextID = String(eventData.getID()).split("|")[0];
        // Consume the event by emptying its content (here by emptying the event data content
        // alternate way consists in deleting the event data node
        var eventDataContent = eventData.getValue("EventData").getSimpleValue();
        eventDataContent = eventDataContent ? JSON.parse(eventDataContent) : [];
        // !ERROR cannot write here : eventData.getValue("EventData").deleteCurrent();
        var gqlMutation = "mutation m_" + nodeID + " {\n" +
            "executeAction(context:\"" + contextID + "\",workspace:\"Main\", input:{ \n" +
                "node:\"" + eventData.getID() + "\" nodeType: Entity, action: \"EventDataConsume\" }) { \n" +
                    "node { \n" +
                        "id \n" +
                        "... on Entity {\n" +
                            "values(attributes:[\"EventData\"]) {\n" +
                                "simpleValue \n" +
                        "} \n" +
                    "} \n" +
                "} \n" +
            "} \n" +
        "}\n";
        var mutationReturn = GRAPHQL.invoke( GQLGateway, "m_" + nodeID, gqlMutation, gqlToken);
        // Query and extract data from GraphQL and node ID
        var gqlQuery = "query q_" + nodeID + " {\n" +
            "product( context: \"" + contextID + "\", workspace: \"Approved\", id: \"" + nodeID + "\") { \n" +
                "currentRevisionLastEdited \n" +
                "values {\n" +
                    "simpleValue\n" +
                "}\n" +
            "}\n" +
        "}\n";
        var productContent = GRAPHQL.invoke( GQLGateway, "q_" + nodeID, gqlQuery, gqlToken);
        // attach specific event content to the returned data structure
        productContent.event = eventDataContent;
        NodeHandlerResult.addMessage( JSON.stringify(productContent));
        ExecutionReportLogger.logInfo( "Data collected for " + nodeID + " in context " + contextID);
    }
}

