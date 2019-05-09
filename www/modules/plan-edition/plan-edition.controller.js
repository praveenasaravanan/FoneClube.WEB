(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('PlanEditionController', PlanEditionController);
    
      PlanEditionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function PlanEditionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;
            vm.ativacao = [true,false];
            vm.planOperator = ['CLARO','VIVO']
            vm.onClickEditPlan = onClickEditPlan;
            vm.onClickEditService = onClickEditService;
            // vm.operator = [{id:1, operator:'CLARO'},{id:2, operator:'VIVO'}]
            
            console.log('-- Plan Edition --')

            FoneclubeService.getAllPlanOptios().then(function (result) {
                console.log('result')
                
                vm.allPlans = result;
                for(var i in vm.allPlans){
                    if(vm.allPlans[i].IdOperator == 1)
                        vm.allPlans[i].currentPlan = 'CLARO'
                    else
                        vm.allPlans[i].currentPlan = 'VIVO'
                    
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
                    if(result)
                        alert('Serviço atualizado')
                    else{
                        alert('Serviço não atualizado')
                    }    
                })
            }

            function onClickEditPlan(plan){
                console.log('edit plan:')
                console.log(plan)
                plan.Active = plan.selectedActive;
                console.log(vm.selectedOperatorId)
                debugger
                FoneclubeService.postUpdatePhonePlan(plan).then(function (result) {
                    console.log('result services postUpdatePhonePlan')
                    console.log(result)
                    if(result)
                        alert('Plano atualizado')
                    else{
                        alert('Plano não atualizado')
                    } 
                    
                })
            }

        }
    })();
    