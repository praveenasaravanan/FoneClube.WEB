(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('ReportComissionController', ReportComissionController);
    
      ReportComissionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function ReportComissionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;            
            vm.onSearchHistory = onSearchHistory;
            vm.changeFilterComissionHistory = changeFilterComissionHistory;
            vm.changeFilterBonusHistory = changeFilterBonusHistory;
            vm.changeFilterLogBonus = changeFilterLogBonus;

            console.log('-- report comission Edition --');


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

            function onSearchHistory(){
                console.log('search')
                console.log(vm.comissionHistory)
                console.log(vm.bonusHistory)
                console.log(vm.logBonus)
                console.log(vm.total)

                vm.loading = true;
            }

            function changeFilterComissionHistory(){
                vm.comissionHistory = true;
                vm.bonusHistory = false
                vm.logBonus = false
            }

            function changeFilterBonusHistory(){
                vm.comissionHistory = false;
                vm.bonusHistory = true
                vm.logBonus = false
            }

            function changeFilterLogBonus(){
                vm.comissionHistory = false;
                vm.bonusHistory = false
                vm.logBonus = true
            }

        }
    })();
    