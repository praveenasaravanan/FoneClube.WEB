(function() {
    'use strict';
    angular.module('foneClub')
    .controller('MenuController', menuController);

    menuController.$inject = ['$scope', '$window', '$state', 'localStorageService', 'FlowManagerService', '$rootScope'];

    function menuController($scope, $window, $state, localStorageService, FlowManagerService, $rootScope) {
        var vm = this;     
        vm.compress = false; 
        vm.compressMobile = false; 
        vm.mobile = false;              
        vm.menuItemActive = localStorageService.get('menuItemActive');        
        function init() {
            vm.mobile = $window.innerWidth <= 767;
        }
        init();
        vm.menuCompress = function() {
            if ($window.innerWidth >= 767) {
                vm.compress = !vm.compress;                 
            } else if ($window.innerWidth <= 767) {
                vm.compressMobile = !vm.compressMobile;
            }
        }                   
        
        $rootScope.$on('changeMenuItem', function(event, args) {
            saveMenu(args);
        });

        $rootScope.$on('menu-hamburguer', function() {
            vm.menuCompress();
        })
/*-----------------------------------*/



        vm.setMenuItemActive = function(screen) {
            saveMenu(screen)
            
            if(screen == 'home') {
                FlowManagerService.changeHomeView();
            } else if (screen == 'cadastro') {
                FlowManagerService.changeCadastro();
            } else if (screen == 'list-customer') {
                FlowManagerService.changeListCustomer();
            } else if (screen == 'customers') {
                FlowManagerService.changeCustomersView();
            } else if (screen == 'mass-charging') {
                FlowManagerService.changeMassChargingView();
            } else if(screen =='status-charging'){
                FlowManagerService.changeStatusChargingView();
            } else if(screen == 'allphone-lines'){
                FlowManagerService.changeAllPhoneLinesView();
            } else {
                
            }
        }
        
        angular.element($window).bind('resize', function(){            
            if ($window.innerWidth <= 767 && !vm.mobile) {               
                vm.compress = false;
                vm.mobile = true;
                $scope.$apply();
            } else if ($window.innerWidth >= 767 && vm.mobile) { 
                vm.mobile = false;
                vm.compressmobile = false;
                $scope.$apply();
            }                                    
        });

        function saveMenu(screen) {
            vm.menuItemActive = screen;
            localStorageService.set('menuItemActive', screen);
        }
    }
})();