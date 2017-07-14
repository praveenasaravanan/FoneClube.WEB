(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('EdicaoController', EdicaoController);

    EdicaoController.inject = ['$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils', '$stateParams', 'FlowManagerService'];
    function EdicaoController($ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils, $stateParams, FlowManagerService) {
        var vm = this;
        vm.onTapSendUser = onTapSendUser;
        vm.validateData = validateData;
        vm.onTapRemoveNewNumber = onTapRemoveNewNumber;
        vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
        vm.goBack = goBack;
        
        vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '';
        vm.requesting = true;
        init();
        
        function init(){
            if (!vm.cpf) {
                FlowManagerService.changeCustomersView();
                return;
            }
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                vm.customer = result;
                vm.customer.Born = getFormatedDate(vm.customer.Born);
                for(var i=0; i < vm.customer.Adresses.length;i++){
                    vm.customer.Adresses[i].StreetNumber = parseInt(vm.customer.Adresses[i].StreetNumber);
                }
                FoneclubeService.getPlans().then(function(result){
                    vm.plans = result;
                    vm.requesting = false; // mover para a promessa de baixo, ou remover-la
                });
                /*FoneclubeService.getCustomerPlans(vm.cpf).then(function(customerPlans){
                    var valueTotal = 0;
                    if(customerPlans.length > 0) {
                        for(var i=0; i<customerPlans.length;i++){
                            valueTotal = valueTotal + customerPlans[i].Value;
                        }
                    }
                    vm.customer.Plans = customerPlans;
                    //vm.customer = result; 
                });*/
            });
            
        };

        function getFormatedDate(param) {
            var date = new Date(param);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            if (day < 10) {day = "0" + day;}
            if (month < 10) {month = "0" + month;}
            return day + '/' + month + '/' + year;
        }
        
        function validateData() {
            if (vm.requesting || vm.customer.DocumentNumber.length < 11) {return true}
            
            var totalPriceValidade = 0;
            for (var i in vm.customer.Phones) {
                vm.plans.find(function (element, index, array) {
                    if (element.Id == vm.customer.Phones[i].IdPlanOption) {
                        totalPriceValidade = totalPriceValidade + element.Value / 100;
                    }
                });
            }
            if (vm.customer.SinglePrice) {
                if ((vm.customer.SinglePrice / 100) > totalPriceValidade) {
                    return true;
                }
            }

            /*if(
                vm.customer.DocumentNumber.length < 11
                || vm.customer.Born.length < 10
                || vm.customer.Name.length == 0
                || vm.customer.Adresses[0].Cep.length < 9
                || vm.customer.Adresses[0].Street.length == 0
                || vm.customer.Adresses[0].StreetNumber.length == 0
                || vm.customer.Adresses[0].Neighborhood.length == 0
                || vm.customer.Adresses[0].City.length == 0
                || vm.customer.Adresses[0].State.length == 0
                || vm.customer.Email.length == 0
            ) {
                return true;
            }
            for (var i=0; i < vm.customer.Phones.length; i++) {
                if (vm.customer.Phones[i].IsFoneclube) {
                    if (!vm.customer.Phones[i].Delete) {
                        if(!vm.customer.Phones[i].NickName) {
                            return true;
                        }
                        if(vm.customer.Phones[i].IdPlanOption == 0) {
                            return true;
                        } 
                    }
                } else {
                    if(vm.customer.Phones[i].DDD.length == 0) {
                        return true;
                    }
                    if(vm.customer.Phones[i].Number.length < 9) {
                        return true;
                    } 
                }
            }*/
            return false;
        }
        
        function onTapRemoveNewNumber(position){
            /*var i = MainComponents.infoAlert(
            {
                mensagem: 'teste'
            });*/
            vm.customer.Phones[position].Delete = true;
        }
        
        function onTapNewPhoneNumber() {
            vm.customer.Phones.push(
                {
                    'DDD': '',
                    'Delete': null,
                    'Id': null,
                    'IdOperator': 0,
                    'IdPlanOption': 0,
                    'Inative': null,
                    'IsFoneclube': true,
                    'NickName': '',
                    'Number': '',
                    'Portability': false
                }
            );
        }
        
        function onTapSendUser(customer){
            vm.requesting = true;
            
            var customerSend = {
                "Id": customer.Id,
                "DocumentNumber": customer.DocumentNumber,
                "Register": customer.Register,
                "Name": customer.Name,
                "NickName": customer.NickName,
                "Email": customer.Email,
                "Born": customer.Born,
                "Gender": customer.Gender,
                "IdPlanOption": customer.IdPlanOption,
                "IdPagarme": customer.IdPagarme,
                "IdRole": customer.IdRole,
                "IdCurrentOperator": customer.IdCurrentOperator,
                "Adresses": customer.Adresses,
                "Phones": customer.Phones,
                "Images": customer.Images,
                "IdParent": customer.IdParent,
                "IdContactParent": customer.IdContactParent,
                "NameContactParent": customer.NameContactParent,
                "IdCommissionLevel": customer.IdCommissionLevel,
                "SinglePrice": customer.SinglePrice,
                "DescriptionSinglePrice": customer.DescriptionSinglePrice
            }
            
            for (var i=0; i < customerSend.Phones.length; i++) {
                customerSend.Phones[i].DDD = clearPhoneNumber(customerSend.Phones[i].DDD);
                customerSend.Phones[i].Number = clearPhoneNumber(customerSend.Phones[i].Number);
            }
            
            FoneclubeService.postUpdateCustomer(customerSend).then(function(result){
                if(result) {
                    var params = {
                        title: 'Edição Realizada',
                        template: 'Todos dados pessoais enviados, edição Foneclube feita com sucesso.',
                        buttons: [
                            {
                                text: 'Ir para Home',
                                type: 'button-positive',
                                onTap: function(e) {
                                    FlowManagerService.changeHomeView();
                                }
                            },
                            {
                                text: 'Visualizar Cliente',
                                type: 'button-positive',
                                onTap: function(e) {
                                    FlowManagerService.changeCustomersView();
                                    FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                                        ViewModelUtilsService.showModalCustomer(result);
                                    });
                                }
                            }
                        ]
                    }
                    MainComponents.show(params);
                }
                vm.requesting = false;
            }).catch(function(error){
                MainComponents.alert({mensagem:error.statusText});
                vm.requesting = false;
            });
        };

        function clearPhoneNumber(number) {
            return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : '';
        }
        
        function goBack() {
            FlowManagerService.goBack();
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                ViewModelUtilsService.showModalCustomer(result);
            });
        }
    }
})();