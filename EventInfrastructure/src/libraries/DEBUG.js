// Library DEBUG
/* global java */
var traceName       = '';
var debugFile       = null;
var CONST_DEBUG_DIR = '/shared/exports/Debug';  // MUST be adapted to the environment
var traceTime       = null;
var DEBUG_CHECK     = true;
var startTime        = null;
var logger          = null;

function start(name, log, debugCheck) {
	logger = log;
    traceName = name;
    traceTime = java.lang.System.currentTimeMillis();
    startTime = traceTime;
    if (debugCheck)
        DEBUG_CHECK = debugCheck;
    if (DEBUG_CHECK) {
        var dir = new java.io.File(CONST_DEBUG_DIR);
        if (!dir.exists()) {
            dir.mkdir();
        }
        var fileName = "/" + traceName + "-" + java.lang.Thread.currentThread().getId() + ".log";
        debugFile = new java.io.FileWriter(CONST_DEBUG_DIR + fileName, true);
        debugFile.write("\nStart " + name + ":\t(" + (new Date()).toUTCString() + ")\n");
    }
}


function end() {
    if (DEBUG_CHECK && debugFile !== null) {
        var currentTime = java.lang.System.currentTimeMillis();
        debugFile.write(traceName + " (" + (currentTime - traceTime) +
                " ms)  total time = " + (currentTime - startTime) + " ms -- END.\n");
        debugFile.flush();
        debugFile.close();
        debugFile = null;
    }
}

function log(message) {
    if (DEBUG_CHECK && debugFile !== null) {
        var currentTime = java.lang.System.currentTimeMillis();
        var infoMessage = traceName + " (" + (currentTime - traceTime) + " ms): " + message;
        debugFile.write(infoMessage + "\n");
        debugFile.flush();
        logger.info(infoMessage);
        traceTime = currentTime;
    }
}

function endOnException( jsException) {
    var excMsg = jsException.rhinoException instanceof java.lang.Object ? 
                    jsException.rhinoException : jsException;
    log( "EXCEPTION -> " + excMsg);
    end();
    return jsException;
}
