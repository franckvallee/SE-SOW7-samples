// Library EZTree => node level functions to manage parent and children
/* global java, com */

function getSiblings( node) {
    return node.getParent().getChildren().toArray()
        .filter( function( child) { 
            return !child.getID().equals(node.getID());
        });
}

// visitor is function( node, params) which is applied to every subnodes
function visitHierarchy(node, visitor, params, isRecursive) {
    node.getChildren().forEach( function (child) {
        visitor(child, params);
        if (isRecursive) {
            visitHierarchy( child, visitor, params, true);
        }
    });
}

function isSubNodeOf( node, parentNodeID) {
    var parent = node.getParent();
    while ( parent && !parent.getID().equals(parentNodeID) ) {
        parent = parent.getParent();
    }
    return (parent !== null);
};

function deleteChildrenRecursive( node, withoutApproval) {
    node.getChildren().forEach(function (child) {
        deleteChildrenRecursive(child, withoutApproval);
        withoutApproval ? child.delete() : child.delete().approve();
    });
}

function parentHasChanged( node) {
    var status = node.getApprovalStatus().toString();
    if ( "Not in Approved workspace".equals(status) ) {
        return true;
    }
    var parts = node.getNonApprovedObjects().iterator();
    while (parts.hasNext()) {
        if (parts.next() instanceof com.stibo.core.domain.partobject.ParentPartObject) {
            return true;
        }
    }
    return false;
};

function createChild( node, childID, childName, objectTypeID) {
    try {
        var child;
        if (node instanceof com.stibo.core.domain.Product) {
            child = node.createProduct(childID, objectTypeID);
        }
        else if (node instanceof com.stibo.core.domain.Classification) {
            child = node.createClassification(childID, objectTypeID);
        }
        else if (node instanceof com.stibo.core.domain.entity.Entity) {
            child = node.createEntity(childID, objectTypeID);
        }
        child.setName(childName);
        return child;
    } catch (error) {
        if (error.javaException instanceof com.stibo.core.domain.NodeIdUniqueConstraintException ||
                error.javaException instanceof com.stibo.core.domain.ObjectTypeConstraintException) {
            return null;
        } else {
            throw error;
        }
    }
}

// Create an existing branch of children as defined in hierarchy data.
// branchHierarchyData is an array from first level child down to n-level child.
// Each element of branchHierarchyData is defined by the folowing members: {id, name, typeID}
function createBranchOfChildren( node, branchHierarchyData) {
    var currentParent = node;
    for each (var childData in branchHierarchyData) {
        var existingChilds = currentParent.getChildren().toArray().filter( function (child) { 
            return ( child.getID().equals(childData.id) );
        });
        var child;
        if ( existingChilds.length === 0 ) {
            child = createChild(currentParent, childData.id, childData.name, childData.typeID);
        } else {
            child = existingChilds[0];
            child.setName(childData.name);
        }
        currentParent = child;
    }
    return currentParent;
}
