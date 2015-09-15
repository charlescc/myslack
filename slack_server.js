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
  //var bodyParser = require('body-parser');
  //app.use(bodyParser());



  app.use('/', function(req, res, next) {
    //res.end("hello connect!");
    res.write('<h1>Welcome to Slack </h1>');

  });
  //console.log(http);
  var server = http.createServer(app);
  server.listen(options.port, options.hostname);
  var io = require('socket.io')(server);

  var onlineUsers = {};
  var userCount = 0;
  io.on('connection', function(socket) {
    console.log('new user connected');
    socket.on('login', function(obj) {
      socket.name = obj.userid;
      //检查在线列表，如果不在里面就加入
      if (!onlineUsers.hasOwnProperty(obj.userid)) {
        onlineUsers[obj.userid] = obj.username;
        //在线人数+1
        onlineCount++;
      }
      io.emit('login', {
        onlineUsers: onlineUsers,
        onlineCount: onlineCount,
        user: obj
      });
      console.log(obj.username + '加入了聊天室');
    });
    //监听用户退出
    socket.on('disconnect', function() {
      //将退出的用户从在线列表中删除
      if (onlineUsers.hasOwnProperty(socket.name)) {
        //退出用户的信息
        var obj = {
          userid: socket.name,
          username: onlineUsers[socket.name]
        };

        //删除
        delete onlineUsers[socket.name];
        //在线人数-1
        onlineCount--;

        //向所有客户端广播用户退出
        io.emit('logout', {
          onlineUsers: onlineUsers,
          onlineCount: onlineCount,
          user: obj
        });
        console.log(obj.username + '退出了聊天室');
      }
    });

    //监听用户发布聊天内容
    socket.on('message', function(obj) {
      //向所有客户端广播发布的消息
      io.emit('message', obj);
      console.log(obj.username + '说：' + obj.content);
    });


  });

  //});

};