(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('OrdemServico', OrdemServico);

    OrdemServico.inject = ['$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils', '$stateParams', 'FlowManagerService'];
    function OrdemServico($ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils, $stateParams, FlowManagerService) {
        var vm = this;
        vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '';
        vm.requesting = true;
        vm.onTapSendOS = onTapSendOS;
        vm.goBack = goBack;
        
        init();
        function init() {
            if (!vm.cpf) {
                FlowManagerService.changeCustomersView();
                return;
            }
            vm.data = {
                warn: true,
                text: ''
            };
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                vm.customer = result;
                vm.requesting = false;
            });
        }
        
        function onTapSendOS() {
            var order = {
                "Id": vm.customer.Id,
                "DocumentNumber": vm.customer.DocumentNumber,
                "ServiceOrder": {
                    "AgentName": MainUtils.getAgent(),
                    "AgentId": MainUtils.getAgent(),
                    "PendingInteraction": vm.data.warn,
                    "Description": vm.data.text
                }
            }
            FoneclubeService.postOrderServicePerson(order).then(function(data){
                vm.requesting = false;
                if(result) {
                    FlowManagerService.changeCustomersView();
                    var params = {
                        title: 'Aviso',
                        template: 'Ordem de serviço adicionada com sucesso.',
                        buttons: [
                            {
                                text: 'Fechar',
                                type: 'button-positive',
                                onTap: function(e) {
                                    FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                                        ViewModelUtilsService.showModalCustomer(result);
                                    });
                                }
                            }
                        ]
                    }
                    MainComponents.show(params);
                }
            }).catch(function(error) {
                FlowManagerService.changeCustomersView();
                    var params = {
                        title: 'Aviso',
                        mensagem: 'Houve um erro.'
                    }
                    MainComponents.alert(params);
            });
        }
        
        function goBack() {
            FlowManagerService.goBack();
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                ViewModelUtilsService.showModalCustomer(result);
            });
        }
    }
})();