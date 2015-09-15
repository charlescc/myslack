var app=angular.module('myModule',[]);
app.controller('myController',function($scope){
	$scope.user={
		key:'nickname',
		
		description:'以_或者字母数字组成',
		pattern:/^[_\w]+$/
	};

});