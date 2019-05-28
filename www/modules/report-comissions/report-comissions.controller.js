(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('ReportComissionController', ReportComissionController);
    
      ReportComissionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function ReportComissionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;            
            console.log('-- report comission Edition --')/


            FoneclubeService.getBonusLog().then(function (result) {
                console.log('getBonusLog result')
                console.log(result)
                
            })

            FoneclubeService.getBonusOrderHistory(10).then(function (result) {
                console.log('getBonusOrderHistory result')
                console.log(result)
            })

            FoneclubeService.getComissionsOrderHistory(10).then(function (result) {
                console.log('getComissionsOrderHistory result')
                console.log(result)
            })


        }
    })();
    