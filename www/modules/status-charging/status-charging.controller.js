(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('StatusChargingController', StatusChargingController);
    
        StatusChargingController.inject = ['FlowManagerService', 'MainUtils', 'FoneclubeService'];
        function StatusChargingController(FlowManagerService, MainUtils, FoneclubeService) {
            var vm = this;
            console.log('--- StatusChargingController --- ' );
            vm.totalCharged = '...';
            vm.totalReceived = '...';
            vm.searchStatusCharging = searchStatusCharging;

            function searchStatusCharging(){
                console.log('searchStatusCharging')
                console.log( vm.month + ' ' + vm.year);

                FoneclubeService.getStatusCharging(vm.month,vm.year).then(function (result) {
                    console.log('getStatusCharging')
                    console.log(result)
                    vm.customers = result;
                })
            }
            
    
            
            ////////
            //MainUtils.setAgent('Cardozo');
            //FlowManagerService.changeHomeView();
            ////////
    
        }
    
    })();