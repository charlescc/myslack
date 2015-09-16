var app = angular.module('myModule', ['directiveModule']);
app.service('userService', function($rootScope) {
	var uid, username, userchannel, socket, sysMsg;
	var genUid = function() {
		return new Date().getTime() + '' + Math.floor(Math.random() * 10000)
	}
	var updateSysMsg = function(obj, action) {
		var _user = obj.user;
		var _online_users = obj.onlineUsers;
		var _online_count = obj.onlineCount;

		sysMsg = "";
		if (action == 'login') {
			sysMsg += (_user.username + " Join In Realtime Slack");
		} else {
			sysMsg += (_user.username + ' Leave Realtime Slack');
		}
		$rootScope.$broadcast('updateSysMsg', sysMsg, _online_users, _online_count);

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
			userchannel: userchannel
		});
		socket.on('login', function(obj) {
			updateSysMsg(obj, 'login');

		});
		socket.on('logout', function(obj) {
			updateSysMsg(obj, 'logout');
		});
	}

});
app.controller('myController', function($scope, userService) {
	$scope.user = {
		key: 'nickname',

		description: '以_或者字母数字组成',
		pattern: /^[_\w]+$/
	};
	$scope.showLogin = true;
	$scope.userSubmit = function() {
		userService.init($scope.user.name);
		$scope.showLogin = false;
	}
	var onlineUsers_adapter = function(onlineUsers, callback) {
		for (var i in onlineUsers) {
			if (onlineUsers.hasOwnProperty(i)) {
				callback({
					username: onlineUsers[i],
					userid: i
				});	
			}
		}
	}
	$scope.$on('updateSysMsg', function(e, sysMsg, onlineUsers, onlineCount) {
		console.log(sysMsg);
		$scope.user_groups = [{
			channel: 'default',
			members: []
		}];
		onlineUsers_adapter(onlineUsers, function(user_obj) {

			$scope.user_groups[0].members.push({
				name:user_obj.username,
				highlight:user_obj.username == $scope.user.name?1:undefined,
				url:undefined
			});
		});
		$scope.$apply();


	})

});