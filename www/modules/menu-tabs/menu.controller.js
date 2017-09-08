(function() {
    'use strict';
    angular.module('foneClub')
    .controller('MenuController', menuController);

    menuController.$inject = ['$scope', '$window', '$state', 'localStorageService'];

    function menuController($scope, $window, $state, localStorageService) {
        var vm = this;     
        vm.compress = false;                
        vm.menuItemActive = localStorageService.get('menuItemActive');        

        vm.menuCompress = function() {
            if ($window.innerWidth >= 767) {
                vm.compress = !vm.compress;                 
            }        
        }                      

        vm.setMenuItemActive = function(screen) {
            vm.menuItemActive = screen;
            localStorageService.set('menuItemActive', screen);
        }
        
        angular.element($window).bind('resize', function(){            
           if ($window.innerWidth <= 767 && vm.compress) {               
               vm.compress = false;
               $scope.$apply();
           }
       });     
    }
})();