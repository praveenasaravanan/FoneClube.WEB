(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('AllPhonesController', AllPhonesController);
    
      AllPhonesController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService', 'NgTableParams', '$scope'];
      function AllPhonesController(FlowManagerService, FoneclubeService, PagarmeService, NgTableParams, $scope) {
            
        var vm = this;
        vm.planOptions;
        vm.result;
        vm.filtroCliente = false;

        vm.changeFilterCliente = changeFilterCliente;
        vm.onClickDesassociar = onClickDesassociar; 
        vm.changeSelectPlan = changeSelectPlan;
        vm.onClickTrocaPlano = onClickTrocaPlano;

        FoneclubeService.getAllPhonesStatus().then(function(result){

            FoneclubeService.getPlanOptios().then(function(result){

                vm.planOptions = result;
                // vm.planOptions.forEach(plan => {
                //     console.log(plan)
                // });

            FoneclubeService.getStatusTelefonesOperadora().then(function (result) {

                for(var i in vm.result)
                {
                    var telefone = vm.result[i].linhaLivreOperadora;
                    vm.result[i].usoLinha = "Sem dados na SP";
                    vm.result[i].plano = "Sem dados na SP";
                    vm.result[i].divergente = -1;

                    for(var r in result){
                        if(telefone == result[r].phone){

                            var operadora; 
                            if(result[r].operadora == 1)
                            {
                                operadora = 'CLARO'
                            } 
                            else if(result[r].operadora == 2)
                            {
                                operadora = 'VIVO'
                            }

                            vm.result[i].plano = operadora + " " + result[r].plano;
                            vm.result[i].usoLinha = result[r].usoLinha ? "Sim" : "Não";
                        }
                    }
                }

                vm.result
                
            })

        })
            

            for(var i in result){
                result[i].desativada = false;

                if(result[i].operadora == 1)
                    result[i].operadoraDescription = 'CLARO'
                else
                    result[i].operadoraDescription = 'VIVO'

                if(result[i].idPhone == null)
                    result[i].PhoneText = 'Não'
                else
                    result[i].PhoneText = 'Sim'
            }

            vm.result = result

            vm.initialParams = {
                filter: { desativada: false },
                count: 1000 // initial page size
              };
            vm.initialSettings = {
            // page size buttons (right set of buttons in demo)
            counts: [50,100,500, 1000],
            // determines the pager buttons (left set of buttons in demo)
            paginationMaxBlocks: 10,
            paginationMinBlocks: 1,
             
            dataset: vm.result
            
            };

            vm.tableParams = new NgTableParams(vm.initialParams, vm.initialSettings)
            
        })

        $scope.$watch("vm.tableParams", function () {            
            console.log('Works')
        });

        function changeFilterCliente(){
            console.log('changeFilterCliente')
            vm.filtroCliente = !vm.filtroCliente;

            // remonta lista e atualiza componente

            //filtra direto na tabela
        }

        function onClickDesassociar(linha){
            
            var confirmation = confirm("Deseja desativar essa linha?");
            if (confirmation) {
                FoneclubeService.postDesassociarLinha(linha.idPhone).then(function(result){
                    if(result){
                        alert('Telefone desativado com sucesso')

                        linha.idPhone = null;
                        linha.txtName = ''
                        linha.txtNickname = ''
                        linha.intIdPerson = ''
                        linha.txtPlanoFoneclube = ''
                        linha.PhoneText = 'Não'
                        
                        // caso seja pra limpar
                        // linha.desativada = true;
                        // vm.tableParams.reload();
                    }
                    else{
                        alert('Não foi possível desativar essa linha do cliente')
                    }
                })
                .catch(function (error) {
                    alert('Não foi possível desativar essa linha do cliente')
                });
            }  
        }

        function changeSelectPlan(linha){
            console.log('changeSelectPlan')
            
            var confirmation = confirm("Deseja trocar o plano da linha " + linha.linhaLivreOperadora + " para, " +  linha.selectedPlan.Description + ' ?');
            if (confirmation) {
                FoneclubeService.postUpdatePhonePlan({Id:linha.idPhone, IdPlanOption:linha.selectedPlan.Id}).then(function(result){
                    if(result)
                    {
                        alert('Plano alterado com sucesso')
                        linha.txtPlanoFoneclube = linha.selectedPlan.Description;
                        linha.editPlan = false; 
                    }
                    else{
                        alert('Não foi possível alterar o plano dessa linha')
                        linha.editPlan = false; 
                    }
                    
                })
                
            }
            else{
                linha.editPlan = false; 
            }
        }

        function onClickTrocaPlano(linha){
            console.log("onClickTrocaPlano")
            debugger
            if(linha.txtPlanoFoneclube == null)
            {
                alert('Essa linha não tem cliente associado por isso não é possível trocar plano foneclube')
            }
            else
                linha.editPlan = true;
        }
        
      }
    })();
    