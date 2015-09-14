/*
 * connect-server
 * https://github.com/Charles/plugin
 *
 * Copyright (c) 2015 charles
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt, config) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  //grunt.registerMultiTask('connect_server', 'The best Grunt plugin ever.', function() {
  // Merge task-specific and/or target-specific options with these defaults.
  /*var options = this.options({
    punctuation: '.',
    separator: ', '
  });*/

  // Iterate over all specified file groups.
  /*this.files.forEach(function(f) {
    // Concat specified files.
    var src = f.src.filter(function(filepath) {
      // Warn on and remove invalid source files (if nonull was set).
      if (!grunt.file.exists(filepath)) {
        grunt.log.warn('Source file "' + filepath + '" not found.');
        return false;
      } else {
        return true;
      }
    }).map(function(filepath) {
      // Read file source.
      return grunt.file.read(filepath);
    }).join(grunt.util.normalizelf(options.separator));

    // Handle options.
    src += options.punctuation;

    // Write the destination file.
    grunt.file.write(f.dest, src);

    // Print a success message.
    grunt.log.writeln('File "' + f.dest + '" created.');
  });*/
  var fs = require('fs');
  var url = require('url');
  var path = require('path');
  var http = require('http');
  var connect = require('connect');
  var options = config;
  //console.log(options.port);
  var app = connect();
  // gzip/deflate outgoing responses
  var compression = require('compression');
  app.use(compression());
  // parse urlencoded request bodies into req.body
  var bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded());

  app.use(function(req, res, next) {
    res.end("hello connect!");
  });
  //console.log(http);
  http.createServer(app).listen(options.port, options.hostname);



  //});

};