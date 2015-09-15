var app=angular.module('myModule',[]);
app.controller('myController',function($scope){
	$scope.loginInfo=[{
		key:'username',
		placeholder:'Your User Name',
		description:'以_或者字母数字组成',
		pattern:''，
	}];

});