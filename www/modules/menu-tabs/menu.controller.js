(function() {
    'use strict';
    angular.module('foneClub')
    .controller('MenuController', menuController);

    menuController.$inject = ['$scope', '$window', '$state'];

    function menuController($scope, $window, $state) {
        let vm = this;     
        vm.compress = false;
        vm.menuItemActive = 'home';
        vm.menuCompress = function() {
            vm.compress = !vm.compress;
        }                      

        angular.element($window).bind('resize', function(){
            console.log($window.innerWidth);
           if ($window.innerWidth <= 767 && vm.compress) {               
               vm.compress = false;
               $scope.$apply();
           }
       });     
    }
})();