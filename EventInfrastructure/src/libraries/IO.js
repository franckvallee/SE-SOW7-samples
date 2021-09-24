/*
* IO: utilities to access the disk
* Dependency:
* --------------------------------------------------------
* V1.0 06-Oct-2020 Creation
*/
/* global java */
var CONST = {
    BUFFER_SIZE: 512 * 1024,
    UNZIP_DIR: "/tmp/fromzip",
    ZIP_DIR: "/tmp/forzip"
};

/**
 * Directly read a file content from a text file
 * @param {String} filePath file location
 * @returns {String} the file text content
 */
function readFileContent( filePath) {
    var path = java.nio.file.Paths.get(filePath);
    var content = new java.lang.String( 
        java.nio.file.Files.readAllBytes( path));
    return (String(content));
}

/**
 * Directly write a content to a text file
 * @param {String} filePath file location
 * @param {String} content contains the text to write
 */
function writeFileContent( filePath, content) {
    var path = java.nio.file.Paths.get(filePath);
    var fileContent = new java.lang.String( content);
    java.nio.file.Files.write(path, fileContent.getBytes());
}

/**
 * Directly append a content to a text file
 * @param {String} filePath file location
 * @param {String} content contains the text to append
 */
function appendFileContent( filePath, content) {
    var fileWriter = new java.io.FileWriter( filePath, true);
    fileWriter.write( content);
    fileWriter.close();
}

/**
 * Create a unique temporary file
 * @param {String} dirPath defines the location of the temporary file or null for default location
 * @param {String} filePrefix the prefix of the file name
 * @param {String} fileExt the extension part of the file name
 * @returns {String} the path of the new temporary file
 */
function createTmpFile( dirPath, filePrefix, fileExt) {
    var tmpFile;
    if ( dirPath !== null ) {
        var dir = new java.io.File(dirPath);
        tmpFile = java.io.File.createTempFile( filePrefix, "." + fileExt, dir);
    } else {
        tmpFile = java.io.File.createTempFile( filePrefix, "." + fileExt);
    }
    //tmpFile.deleteOnExit(); not required
    return tmpFile.getAbsolutePath();
}

/**
 * Assume a directory path is created (works recursively)
 * @param {String} dirPath is the path to create
 * @return true when created / false when already existed
 */
function mkDirs( dirPath) {
    var dir = new java.io.File(dirPath);
    if ( !dir.exists() ) {
        dir.mkdirs();
        return true;
    }
    return false;
}

/**
 * List the files under a directory
 * @param {String} dirPath defines the directory to list
 * @returns {Array} paths of the found files
 */
function dirListFiles( dirPath) {
    var dirFile = new java.io.File(dirPath);
    var dirFileElts = dirFile.list();
    var pathList = [];
    if ( dirFileElts === null )
        return pathList;
    for ( var i = 0; i < dirFileElts.length; i++ ) {
        var dirFilePath = dirPath + "/" + dirFileElts[i];
        if ( (new java.io.File(dirFilePath)).isFile() )
            pathList.push( dirFilePath);
    }
    return pathList;
}

/**
 * Move a file from a directory to one another
 * @param {String} dirPathSrc
 * @param {String} dirPathTgt
 * @return true when moved / false when not found
 */
function moveFile( dirPathSrc, dirPathTgt) {
    var source = java.nio.file.Paths.get(dirPathSrc);
    if ( !source.toFile().exists() )
        return false;
    var target = java.nio.file.Paths.get(dirPathTgt);
    java.nio.file.Files.move(
            source, target,
            java.nio.file.StandardCopyOption.REPLACE_EXISTING);
    return true;
}

// Just remove this part if ZIP contents are not used in the project...
/**
 * Read a zipped file content (the unzipped content is placed under tmp/unzip)
 * @param {String} filePath file location
 * @returns {String} the unzipped content
 */
function readZipFileContent( filePath) {
    var zipFile = new java.io.File( filePath);
    var content = new java.lang.StringBuilder();
    var inputStream = new java.io.FileInputStream(zipFile);
    var zipStream = new java.util.zip.ZipInputStream(inputStream);
    var zipEntry = zipStream.getNextEntry();
    if ( zipEntry !== null ) {
        var buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, CONST.BUFFER_SIZE);
        var len = zipStream.read(buffer);
        while ( len > 0 ) {
            content.append( new java.lang.String(buffer, 0, len));
            len = zipStream.read(buffer);
        }
        zipStream.closeEntry();
    }
    zipStream.close();
    return String( content.toString());
}

/**
 * Write content to zipped file
 * @param {String} filePath the destunation file path (will be appended with .zip)
 * @param {String} content the content to zip
 * @returns {undefined}
 */
function writeZipFileContent( filePath, content) {
    var pathElts = filePath.split("/");
    var fileName = pathElts[pathElts.length -1];
    // Create the zip file with a single entry
    var outputStream = new java.io.FileOutputStream( filePath + ".zip");
    var zipStream = new java.util.zip.ZipOutputStream(outputStream);
    var zipEntry = new java.util.zip.ZipEntry(fileName);
    zipStream.putNextEntry(zipEntry);
    // Write the content
    var contentBytes = (new java.lang.String(content)).getBytes();
    zipStream.write( contentBytes);
    zipStream.close();
}
