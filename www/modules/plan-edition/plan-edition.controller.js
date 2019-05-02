(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('PlanEditionController', PlanEditionController);
    
      PlanEditionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function PlanEditionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;
            console.log('-- Plan Edition --')

    
        }
    })();
    