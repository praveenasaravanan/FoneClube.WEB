angular.module('foneClub').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        angular.element(document).find('body').bind("keydown", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});