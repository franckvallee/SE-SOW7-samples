/* 
* This is an example of a JSON Joiner for Message-Based OIEP
* Bindings:
*       JoinerSource
*       JoinerResult
*/

/* global JoinerResult, JoinerSource */

JoinerResult.appendToMessage("[");
var insertComma;
while ( JoinerSource.hasNext() ) {
    if ( insertComma ) {
        JoinerResult.appendToMessage(",");
    }
    JoinerResult.appendToMessage(JoinerSource.getNextMessage());
    insertComma = true;
}
JoinerResult.appendToMessage("]");

