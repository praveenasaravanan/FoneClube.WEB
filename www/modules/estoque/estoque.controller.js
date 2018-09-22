(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('EstoqueController', EstoqueController);
    
      EstoqueController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService', 'NgTableParams'];
      function EstoqueController(FlowManagerService, FoneclubeService, PagarmeService, NgTableParams) {
            
        var vm = this;
        // https://codepen.io/cardozo/pen/QVYXeX    
        FoneclubeService.getLinhasEstoque().then(function(result){

            for(var i in result){
                if(result[i].operadora == 1)
                    result[i].operadoraDescription = 'CLARO'
                else
                    result[i].operadoraDescription = 'VIVO'
            }

            vm.tableParams = new NgTableParams({
                sorting: { name: "asc" } 
                }, {
                dataset: result
                });
        })

        
    
      }
    })();
    