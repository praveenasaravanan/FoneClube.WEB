(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('PlanEditionController', PlanEditionController);
    
      PlanEditionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function PlanEditionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;
            vm.ativacao = [true,false];
            vm.onClickEditPlan = onClickEditPlan;
            vm.onClickEditService = onClickEditService;
            // vm.operator = [{id:1, operator:'CLARO'},{id:2, operator:'VIVO'}]
            
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

            

            FoneclubeService.getAllServices().then(function (result) {
                console.log('result services')
                console.log(result)
                

                for(var i in result){
                    if(result[i].Editavel == null){
                        result[i].Editavel = false;
                    }  
                }

                vm.services = result;
            })

            function onClickEditService(service){
                console.log('edit service:')
                console.log(service)

                FoneclubeService.postUpdateServiceFoneclube(service).then(function (result) {
                    console.log('result services postUpdateServiceFoneclube')
                    console.log(result)
                    
                })
            }

            function onClickEditPlan(plan){
                console.log('edit plan:')
                console.log(plan)

                debugger
                FoneclubeService.postUpdatePhonePlan(plan).then(function (result) {
                    console.log('result services postUpdatePhonePlan')
                    console.log(result)
                    
                })
            }

        }
    })();
    