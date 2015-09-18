var app = angular.module('myModule', ['directiveModule', 'textAngular']);
app.service('userService', function($rootScope) {
	var uid, username, userchannel, socket, sysMsg;
	var genUid = function() {
		return new Date().getTime() + '' + Math.floor(Math.random() * 10000);
	}
	var updateSysMsg = function(obj, action) {
		var _user = obj.user;
		var _online_users = obj.onlineUsers;
		var _online_count = obj.onlineCount;

		sysMsg = "";
		if (action == 'login') {
			sysMsg += (_user.username + " Join In Realtime Slack");
		} else if (action == 'logout') {
			sysMsg += (_user.username + ' Leave Realtime Slack');
		} else {
			sysMsg += (_user.username + ' Create New Channel ' + _user.channel);
			var isNewChannel = true;
		}
		$rootScope.$broadcast('updateSysMsg', sysMsg, _online_users, _online_count, isNewChannel, _user.channel);

	}
	var genMsgId = function() {
		return new Date().getTime() + '' + Math.floor(Math.random() * 10000000)
	}
	this.init = function(name, channel) {
		username = name;
		userchannel = channel;
		uid = genUid();

		//连接websocket后端服务器
		socket = io.connect('ws://localhost:9000');
		socket.emit('login', {
			userid: uid,
			username: username,
			channel: userchannel
		});
		socket.on('login', function(obj) {
			updateSysMsg(obj, 'login');

		});
		socket.on('logout', function(obj) {
			updateSysMsg(obj, 'logout');
		});
		socket.on('message', function(obj) {
			var isMe = (obj.userid == uid) ? true : false;
			$rootScope.$broadcast('pushUserMsg', isMe, obj.username, obj.channel, obj.timestamp, obj.content, obj.msgid);
		});
		socket.on('newchannel', function(obj) {
			updateSysMsg(obj, 'newchannel');
		});
	}
	this.submitMsg = function(content, channel) {
		socket.emit('message', {
			userid: uid,
			channel: channel,
			username: username,
			timestamp: new Date().toISOString().replace(/^[^T]+T/, '').replace(/\.[\s\S]*$/, ''),
			msgid: genMsgId(),
			content: content
		});

	}
	this.addChannel = function(channel) {
		socket.emit('newchannel', {
			channel: channel,
			userid: uid,
			username: username
		});
	}
});
app.controller('myController', function($scope, userService) {
	var All_Channel_Content = {
		"default": []
	};
	$scope.user_groups = [{
		channel: 'default',
		members: []
	}];
	$scope.user = {
		key: 'nickname',
		channel: 'default',
		description: '以_或者字母数字组成',
		pattern: /^[_\w]+$/
	};
	$scope.activeChannel = 'default';
	$scope.showLogin = true;
	$scope.userSubmit = function() {
		userService.init($scope.user.name, $scope.user.channel);
		$scope.showLogin = false;
	}
	$scope.addChannel = function() {
		var temp_channel = $scope.new_channel;
		$scope.newchannel = '';
		$scope.channelFormShow = false;
		if ((typeof temp_channel == undefined) || (temp_channel == '')) return;
		userService.addChannel(temp_channel);
	}
	$scope.popChannelForm = function(e) {
		e.stopPropagation();
		$scope.channelFormShow = true;
	}
	var onlineUsers_adapter = function(onlineUsers, callback) {
		for (var i in onlineUsers) {
			if (onlineUsers.hasOwnProperty(i)) {
				var index=0;
				for (var j in onlineUsers[i]) {
					if (onlineUsers[i].hasOwnProperty(j)) {
						index = 1;
						callback({
							username: onlineUsers[i][j],
							userid: j,
							channel: i
						});
					}

				}
				if(index == 1) break;
				callback({
					channel: i
				});


			}
		}
	}
	$scope.$on('updateSysMsg', function(e, sysMsg, onlineUsers, onlineCount, new_flag, newchannel) {
		console.log(sysMsg);
		var channel_ExistInGroup = function(channel) {
			var target_array = $scope.user_groups;
			for (var i = 0; i < target_array.length; i++) {
				if (target_array[i].channel == channel) {
					return i;
				}
			}
			return undefined;
		};
		if (typeof new_flag == 'undefined') { //login,logout
			$scope.user_groups = [{
				channel: 'default',
				members: []
			}];
			onlineUsers_adapter(onlineUsers, function(user_obj) {

				/*$scope.user_groups[0].members.push({
					name: user_obj.username,
					highlight: user_obj.username == $scope.user.name ? 1 : undefined,
					url: undefined
				});*/

				var index = channel_ExistInGroup(user_obj.channel);
				if (!isNaN(index)) { //当前channel存在
					if (typeof user_obj.username != 'undefined') {
						$scope.user_groups[index].members.push({
							name: user_obj.username,
							highlight: user_obj.username == $scope.user.name ? 1 : undefined,
							url: undefined
						});
					}
				} else { //当前channel不存在
					var obj = {
						channel: user_obj.channel,
						members: []
					};
					if (typeof user_obj.username != 'undefined') {
						obj.members.push({
							name: user_obj.username,
							highlight: user_obj.username == $scope.user.name ? 1 : undefined,
							url: undefined
						});
					}
					$scope.user_groups.push(obj);
					All_Channel_Content[user_obj.channel] = [];
				}
			});
		} else { //newchannel
			$scope.user_groups.push({
				channel: newchannel,
				members: []
			});
			All_Channel_Content[newchannel] = [];
		}

		$scope.$apply();
	});
	$scope.submitMsg = function(e) {
		e.stopPropagation();
		console.log($scope.htmlVariable);
		var content = "";
		content = $scope.htmlVariable;
		if (content == '') return;
		var channel = $scope.activeChannel;
		userService.submitMsg(content, channel);
		$scope.htmlVariable = '';
	}
	$scope.realtimeContent = [];

	$scope.$on('pushUserMsg', function(e, isMe, username, channel, timestamp, content, msgid) {
		if (channel == $scope.activeChannel) { //当前活动channel来了新消息
			$scope.realtimeContent.push({
				username: username,
				timestamp: timestamp,
				isMe: isMe,
				content: content,
				msgid: msgid
			});
			$('#msg_container').animate({
				scrollTop: $(msg_container).height()
			}, "slow");

		}
		All_Channel_Content[channel].push({
			username: username,
			timestamp: timestamp,
			isMe: isMe,
			content: content,
			msgid: msgid
		});

		//document.getElementById('msg_container').scrollTo(0, 20);;
		//window.scrollTo(0,20);
		$scope.$apply();
	});

});