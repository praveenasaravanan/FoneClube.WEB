(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('ReportComissionController', ReportComissionController);
    
      ReportComissionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function ReportComissionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;            
            console.log('-- report comission Edition --')


        }
    })();
    