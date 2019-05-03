(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('PlanEditionController', PlanEditionController);
    
      PlanEditionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function PlanEditionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;
            vm.operator = [{id:1, operator:'CLARO'},{id:2, operator:'VIVO'}]
            
            console.log('-- Plan Edition --')

            FoneclubeService.getAllPlanOptios().then(function (result) {
                console.log('result')
                
                vm.allPlans = result;
                for(var i in vm.allPlans){
                    if(vm.allPlans[i].IdOperator == 1)
                        vm.allPlans[i].currentPlan = [{id:1, operator:'CLARO', selected:true},{id:2, operator:'VIVO'}]
                    else
                        vm.allPlans[i].currentPlan = [{id:2, operator:'VIVO', selected:true}, {id:1, operator:'CLARO'}]
                    
                }

                console.log(result)
            })

        }
    })();
    