(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('StatusChargingController', StatusChargingController);
    
        StatusChargingController.inject = ['FlowManagerService', 'MainUtils'];
        function StatusChargingController(FlowManagerService, MainUtils) {
            var vm = this;
            console.log('--- StatusChargingController --- ' );
            
    
            
            ////////
            //MainUtils.setAgent('Cardozo');
            //FlowManagerService.changeHomeView();
            ////////
    
        }
    
    })();