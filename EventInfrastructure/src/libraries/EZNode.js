// Library EZNode => node level functions to manage STEP data nodes
/* global java, com */

// general node functions
function getContextID( node) {
    return String( node.getManager().getCurrentContext().getID());
}

function getObjectTypeID( node) {
    return String(node.getObjectType().getID());
}

// node value functions
function isValueContextInherited(node, attributeID) {
    return (node.getValue(attributeID).isDimensionPointInherited());
}

function isValueDerived( node, attributeID) {
    return (node.getValue(attributeID).isDerived());
}

function Encode(content) {
    if ( !content || content === "") {
        return "";
    }
    var encoded1 = String(content).replace(/</g, "<lt/");
    var encoded2 = encoded1.replace(/>/g, "<gt/>");
    return encoded2.replace(/<lt\//g, "<lt/>");
}

function Decode(content) {
    if ( !content || content === "") {
        return "";
    }
    var decoded = String(content).replace(/<lt\/>/g, "<");
    return decoded.replace(/<gt\/>/g, ">");
}

function getName(node) {
    return Decode( node.getName());
}

function setName(node, nameValue) {
    node.setName( Encode(nameValue));
}

function getSimpleValue(node, attributeID) {
    return Decode( node.getValue(attributeID).getSimpleValue());
}

function setSimpleValue(node, attributeID, content) {
    node.getValue(attributeID).setSimpleValue(Encode(content));
}

function getMultiValues(node, attributeID) {
    var jsValues = [];
    var valuesItr = node.getValue(attributeID).getValues().iterator();
    while (valuesItr.hasNext()) {
        jsValues.push(Decode(valuesItr.next().getValue()));
    }
    return jsValues;
}

function setMultiValues(node, attributeID, values) {
    var mvBuilder = node.getValue(attributeID).replace();
    for each ( var value in values ) {
        mvBuilder.addValue( Encode(value));
    }
    mvBuilder.apply();
}

function getSimpleLovID(node, attributeID) {
    return Decode( node.getValue(attributeID).getLOVValue().getID());
}

function setSimpleLovID(node, attributeID, lovID) {
    node.getValue(attributeID).setLOVValueByID(Encode(lovID));
}

function getMultiLovIDs(node, attributeID) {
    var jsLovIDs = [];
    var valuesItr = node.getValue(attributeID).getValues().iterator();
    while (valuesItr.hasNext()) {
        jsLovIDs.push(Decode(valuesItr.next().getID()));
    }
    return jsLovIDs;
}

function setMultiLovIDs(node, attributeID, lovIDs) {
    var mvBuilder = node.getValue(attributeID).replace();
    for each ( var lovID in lovIDs ) {
        mvBuilder.addLOVValueByID( Encode(lovID));
    }
    mvBuilder.apply();
}

function getValuedAttributeIDs( node) {
    var valuesItr = node.getValues().iterator();
    var attributeIDs = [];
    while ( valuesItr.hasNext() ) {
        attributeIDs.push( String(valuesItr.next().getAttribute().getID()));
    }
    return attributeIDs;
}

// approval and life cycle functions
function approve(node) {
    var jsErrors = [];
    var approvalErrors = node.approve();
    if ( approvalErrors ) {
        var errorsItr = approvalErrors.iterator();
        while ( errorsItr.hasNext() ) {
            jsErrors.push( String(errorsItr.next().getMessage()));
        }
    }
    return jsErrors;
}

function isApproved(node) {
    var status = node.getApprovalStatus().toString();
    return ( "Completely Approved".equals(status) || "Approved in current context".equals(status) );
}

function isCompletelyApproved(node) {
    var status = node.getApprovalStatus().toString();
    return ( "Completely Approved".equals(status) );
}

function hasNeverBeenApproved(node) {
    var status = node.getApprovalStatus().toString();
    return ( "Not in Approved workspace".equals(status) );
}

function deleteNode( node, withoutApproval) {
    return ( withoutApproval ? node.delete() : node.delete().approve() );
}

function getChangedPartsByType(node, partClassName) {
    var selectedParts = new java.util.HashSet();
    var parts = node.getNonApprovedObjects().iterator();
    while (parts.hasNext()) {
        var part = parts.next();
        if (part instanceof partClassName) {
            selectedParts.add(part);
        }
    }
    return selectedParts;
}

function nameHasChanged(node) {
    return hasNeverBeenApproved(node)
        || !getChangedPartsByType(com.stibo.core.domain.partobject.NamePartObject).isEmpty();
}

function getChangedAtrributeIDs(node) {
    if ( hasNeverBeenApproved(node) ) {
        return getValuedAttributeIDs(node);
    }
    var changedAttributeIDs = [];
    var changedParts = getChangedPartsByType( node, com.stibo.core.domain.partobject.ValuePartObject).iterator();
    while ( changedParts.hasNext() ) {
        changedAttributeIDs.push(String(changedParts.next().getAttributeID()));
    }
    return changedAttributeIDs;
}

function partialApproveValues(node, attributeIDs) {
    var changedParts = getChangedPartsByType(node, com.stibo.core.domain.partobject.ValuePartObject).iterator();
    var approveParts = new java.util.HashSet();
    while (changedParts.hasNext()) {
        var changedPart = changedParts.next();
        if (attributeIDs.indexOf(String(changedPart.getAttributeID())) >= 0) {
            approveParts.add(changedPart);
        }
    }
    node.approve(approveParts);
}
