(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('EstoqueController', EstoqueController);
    
      EstoqueController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService', 'NgTableParams'];
      function EstoqueController(FlowManagerService, FoneclubeService, PagarmeService, NgTableParams) {
            
        var vm = this;
        vm.result;
        
        // https://codepen.io/cardozo/pen/QVYXeX    
        FoneclubeService.getLinhasEstoque().then(function(result){

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
                debugger;
                
            })
            

            for(var i in result){
                if(result[i].operadora == 1)
                    result[i].operadoraDescription = 'CLARO'
                else
                    result[i].operadoraDescription = 'VIVO'
            }

            vm.result = result

            vm.tableParams = new NgTableParams({
                sorting: { name: "asc" } 
                }, {
                dataset: vm.result
                });
        })

        
    
      }
    })();
    