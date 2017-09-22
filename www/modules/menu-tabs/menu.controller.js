(function() {
    'use strict';
    angular.module('foneClub')
    .controller('MenuController', menuController);

    menuController.$inject = ['$scope', '$window', '$state', 'localStorageService', 'FlowManagerService'];

    function menuController($scope, $window, $state, localStorageService, FlowManagerService) {
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
            
            if(screen == 'home') {
                FlowManagerService.changeHomeView();
            } else if (screen == 'cadastro') {
                FlowManagerService.changeCadastro();
            } else if (screen == 'list-customer') {
                FlowManagerService.changeListCustomer();
            } else if (screen == 'customers') {
                FlowManagerService.changeCustomersView();
            }

        }
        
        angular.element($window).bind('resize', function(){            
           if ($window.innerWidth <= 767 && vm.compress) {               
               vm.compress = false;
               $scope.$apply();
           }
       });     
    }
})();