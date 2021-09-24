/*
* GRAPHQL: utilities to run graphql requests
* Dependency:
* --------------------------------------------------------
* V1.0 29-Jun-2021 Creation
*/
/* global java */

var GLOBAL = {
    user: "stepsys",
    pass: "stepsys"
};

/**
 * @param {REST Gateway} gqlGateway
 * @returns {String} the bearer token returned by the server
 */
function getBearerToken( gqlGateway) {
    var httpPost = gqlGateway.post();
    
    var queryParams = new java.util.HashMap();
    queryParams.put("userId", GLOBAL.user);
    queryParams.put("password", GLOBAL.pass);

    httpPost.pathElements("auth");
    httpPost.pathQuery(queryParams);
    httpPost.body("");
    httpPost.acceptContentType("application/text");
    return String(httpPost.invoke());
}

function _getBearerTokernDeadline( authToken) {
    var timePart64 = new java.lang.String(authToken.split(".")[1]);
    var timePart = (new java.util.Base64.getDecoder()).decode(timePart64.getBytes());
    timePart = JSON.parse( new java.lang.String(timePart));
    return Number(timePart.exp);
}

/**
 * 
 * @param {REST Gateway} gqlGateway
 * @param {String} authToken the token returned or renewed by the server or null
 * @returns {String} the renewed token when required
 */
function renewBearerToken( gqlGateway, authToken) {
    if ( !authToken ) {
        return getBearerToken( gqlGateway);
    }
    var deadline = _getBearerTokernDeadline( authToken);
    if ( deadline < java.lang.System.currentTimeMillis() ) {
        return getBearerToken( gqlGateway);
    }
    return authToken;
}
/**
 * Invoque a GraphQL query on the server
 * @param {REST Gateway} gqlGateway
 * @param {String} gqlOpName it the GQL operation name
 * @param {String} gqlRequest is the text of the GQL request (query or mutation)
 * @param {String} authToken the token returned by getBearerToken
 * @returns {Object} the object returned by the query (parsed from JSON)
 * @throws {String} GRAPHQL message(s) in case of error 
 */
function invoke( gqlGateway, gqlOpName, gqlRequest, authToken) {
    var post = gqlGateway.post();
    post.acceptContentType("application/json");
    post.pathElements("graphql");
    var gqlBody = {
        operationName: gqlOpName,
        query: gqlRequest,
        variables: null
    };
    post.body(JSON.stringify(gqlBody));
    post.header( "Authorization", "Bearer " + authToken);
    var gqlReturn = JSON.parse(post.invoke());
    if ( gqlReturn.errors ) {
        errorStr = "";
        for each ( var error in gqlReturn.errors ) {
            errorStr += error.message + "; ";
        }
        throw errorStr;
    }
    return gqlReturn;
}
