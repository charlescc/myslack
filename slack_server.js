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
  /*var options = {
       port:9000,
       hostname:'localhost',
       base:[
         'app'
       ]
     }*/
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
    //res.write('<h1>Welcome to Slack </h1>');

  });
  //console.log(http);
  var server = http.createServer(app);
  server.listen(options.port, options.hostname);
  var io = require('socket.io')(server);

  var onlineUsers = {};
  //var channel_sockets={};
  var onlineCount = 0;
  var getJpegsFromFiles = function(_path, callback) {
    _path = path.normalize(_path);
    _path = path.resolve(process.cwd(), _path);
    //console.log(_path);
    var result = [];
    fs.readdir(_path, function(err, files) {
      // body
      if (err) {
        console.log('get Jpegs error：' + err);
        return;
      }
      files.forEach(function(file) {
        fs.stat(_path + path.sep + file, function(err, stat) {
          if (err) {
            console.log(err);
            return;
          }
          if (stat.isFile()) {
            //console.log(process.cwd());
            //console.log(_path + path.sep + file);

            callback(path.relative(process.cwd()+path.seq+'app', _path + path.sep + file));
          }
        });


      });
    });
  }
  var head_url_array = [];

  getJpegsFromFiles('./app/img/', function(jpeg_url) {
    console.log(jpeg_url);
    head_url_array.push(jpeg_url);
  });
  io.on('connection', function(socket) {
    console.log('new user connected');

    socket.on('login', function(obj) {
      socket.name = obj.userid;
      var channel = obj.channel;
      //检查在线列表，如果不在里面就加入
      // if (!onlineUsers[channel].hasOwnProperty(obj.userid)) {
      // onlineUsers[obj.userid] = obj.username;
      //在线人数+1
      //onlineCount++;
      //}
      if (!onlineUsers.hasOwnProperty(channel)) {
        onlineUsers[channel] = {};
      }
      /*if(!channel_sockets.hasOwnProperty(channel)){
         channel_sockets[channel]=[];
      }*/
      if (!onlineUsers[channel].hasOwnProperty(obj.userid)) {
        onlineUsers[channel][obj.userid] = obj.username;
      }
      //channel_sockets.push(socket);

      //在线人数+1

      onlineCount++;
      io.emit('login', {
        onlineUsers: onlineUsers,
        onlineCount: onlineCount,
        user: obj
      });

      io.emit('pushHeads', {
        heads: head_url_array
      });

      console.log(obj.username + '加入了聊天室,在线人数为' + onlineCount);
    });
    socket.on('newchannel', function(obj) {
      if (!onlineUsers.hasOwnProperty(obj.channel)) {
        onlineUsers[obj.channel] = {};
        io.emit('newchannel', {
          onlineUsers: onlineUsers,
          onlineCount: onlineCount,
          user: obj
        });
        console.log(obj.username + '添加了channel ' + obj.channel);
      }

    });
    //监听用户退出
    socket.on('disconnect', function() {
      //将退出的用户从在线列表中删除
      /*
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
      }*/
      //将退出的用户从在线列表中删除
      for (var x in onlineUsers) {
        if (onlineUsers.hasOwnProperty(x)) {
          //访问每个在线的channel
          if (onlineUsers[x].hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {
              userid: socket.name,
              username: onlineUsers[x][socket.name],

            };
            //删除
            delete onlineUsers[x][socket.name];
            // break;
          }

        }

      }
      onlineCount--;
      //向所有客户端广播用户退出
      io.emit('logout', {
        onlineUsers: onlineUsers,
        onlineCount: onlineCount,
        user: obj
      });
      //console.log('mmm');
      console.log(obj.username + '退出了聊天室,在线人数为' + onlineCount);


    });

    //监听用户发布聊天内容
    socket.on('message', function(obj) {
      //向所在channel广播发布的消息
      /* var socket_array=channel_sockets[obj.channel];
       console.log(socket_array instanceof Array);
       for(var i=0;i<socket_array.length;i++){
         socket_array[i].emit('message',obj);
       }*/
      io.emit('message', obj);
      console.log(obj.username + '在' + obj.channel + 'channel中说：' + obj.content);
    });
    //监听用户跳转channel
    socket.on('changeChannel', function(obj) {
      io.emit('changeChannel', obj);
      console.log(obj.username + '跳转入channel ' + obj.channel);

    });

  });

  //});

};