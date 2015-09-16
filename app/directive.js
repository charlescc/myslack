var app = angular.module('directiveModule', []);
app.directive('accordion', function() {
	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		template: '<div ng-transclude></div>',
		controller: function() {
			var expanders = [];
			this.addExpander = function(expander) {
				expanders.push(expander);
			}
			this.gotOpened = function(selectedExpander) {

				angular.forEach(expanders, function(expander) {
					if (selectedExpander != expander) {
						expander.showList = false;
					}
				});
			}
		}
	}
});
app.directive('expander', function() {
	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		templateUrl: './template/aside_Nav.html',
		scope: {
			title: '=groupTitle',
			//title_id: '=imageExpanderIndex',
			image_items: '=imageItems'
		},
		require:'^?accordion',
		link: function(scope, element, attrs,accordionController) {
			//console.log(scope);
			accordionController.addExpander(scope);
			scope.toggleList = function(e) {
				e.stopPropagation();
				accordionController.gotOpened(scope);
				scope.showList ? scope.showList = false : scope.showList = true;
			}
		}
	}

});