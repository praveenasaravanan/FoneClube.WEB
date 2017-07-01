(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('EdicaoController', EdicaoController);

    EdicaoController.inject = ['$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils', '$stateParams', 'FlowManagerService'];
    function EdicaoController($ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils, $stateParams, FlowManagerService) {
        var vm = this;
        vm.onTapSendUser = onTapSendUser;
        vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '';
        vm.id = $stateParams.data ? $stateParams.data.Id : '';
        init();
        
        function init(){
            /*if (!vm.cpf) {
                FlowManagerService.changeCustomers;
            }*/
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                console.log(result);
                vm.customer = result;
                FoneclubeService.getCustomerPlans(vm.cpf).then(function(customerPlans){
                    var valueTotal = 0;
                    if(customerPlans.length > 0) {
                        for(var i=0; i<customerPlans.length;i++){
                            valueTotal = valueTotal + customerPlans[i].Value;
                        }
                    }
                    vm.customer.Plans = customerPlans;
                    vm.customer = result; 
                });
            });
            FoneclubeService.getPlans().then(function(result){
                console.log(result)
                vm.plans = result;                
            })
        };

        function onTapSendUser(customer){
            FoneclubeService.postUpdatePerson(customer).then(function(result){
            console.log(result);
            if(result)
            {
                etapaComplementar();
                MainComponents.alert({titulo:'Andamento',mensagem:'Dados pessoais enviados, agora preencha os dados Foneclube.'});
            }
            //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                MainComponents.alert({mensagem:error.statusText});
                vm.requesting = false;
            });
        };
    }
})();