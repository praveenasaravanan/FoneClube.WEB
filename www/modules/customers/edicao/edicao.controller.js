(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('EdicaoController', EdicaoController);

    EdicaoController.inject = ['$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils', '$stateParams', 'FlowManagerService', '$timeout', 'HubDevService', '$q'];
    function EdicaoController($ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils, $stateParams, FlowManagerService, $timeout, HubDevService, $q) {
        var vm = this;
        vm.onTapSendUser = onTapSendUser;
        vm.validateData = validateData;
        vm.onTapRemoveNewNumber = onTapRemoveNewNumber;
        vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
        vm.changeNumberPortabilty = changeNumberPortabilty;
        vm.changeNumberNew = changeNumberNew;
        vm.validarCEP = validarCEP;
        vm.validarCPF = validarCPF;
        vm.changePhoneNumber = changePhoneNumber;
        vm.getContactParentName = getContactParentName;
        vm.goBack = goBack;
        
        vm.singlePriceLocal = 0;
        vm.allOperatorOptions = MainUtils.operatorOptions();
        vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '10667103767';
        vm.requesting = true;
        
        init();
        function init(){
            if (!vm.cpf) {
                FlowManagerService.changeCustomersView();
                return;
            }
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                vm.DocumentNumberFreeze = result.DocumentNumber;
                vm.customer = result;
                vm.customer.Born = vm.customer.Born ? getFormatedDate(vm.customer.Born) : '';
                vm.customer.IdCurrentOperator = vm.customer.IdCurrentOperator ? vm.customer.IdCurrentOperator.toString() : '';
                console.log(vm.customer);
                for(var i=0; i < vm.customer.Adresses.length;i++){
                    vm.customer.Adresses[i].StreetNumber = parseInt(vm.customer.Adresses[i].StreetNumber);
                }
                FoneclubeService.getPlans().then(function(result){
                    vm.plans = result;
                    for(var number in vm.customer.Phones) {
                        vm.customer.Phones[number].IdPlanOption = vm.customer.Phones[number].IdPlanOption.toString();
                        vm.customer.Phones[number].NewNumber = !vm.customer.Phones[number].Portability;
                        for (var plan in vm.plans) {
                            if (vm.plans[plan].Id == vm.customer.Phones[number].IdPlanOption) {
                                if (vm.plans[plan].Description.endsWith('VIVO')) {
                                    vm.customer.Phones[number].operadora = '1';
                                } else {
                                    vm.customer.Phones[number].operadora = '2';
                                }
                            }
                        }
                    }
                    
                    vm.requesting = false;
                });
                vm.singlePriceLocal = vm.customer.SinglePrice ? vm.customer.SinglePrice : 0;
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
            if (vm.requesting || vm.customer.DocumentNumber.length < 11) { return true }
            
            var totalPriceValidade = 0;
            for (var i in vm.customer.Phones) {
                vm.plans.find(function (element, index, array) {
                    if (element.Id == vm.customer.Phones[i].IdPlanOption) {
                        totalPriceValidade = totalPriceValidade + element.Value / 100;
                    }
                });
            }
            if (vm.singlePriceLocal) {
                if ((vm.singlePriceLocal / 100) > totalPriceValidade) {
                    return true;
                }
            }
            return false;
        }
        
        function onTapRemoveNewNumber(position){
            var confirmPopup = $ionicPopup.confirm( {
                title: 'Excluir Número',
                template: 'Deseja realmente remover este número?',
                buttons: [
                    {   text: 'Não' },
                    {   text: '<b>Sim</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            return true;
                        }
                    }
                ]
            });
            confirmPopup.then(function(res) {
                if(res) {
                    vm.customer.Phones[position].Delete = true;
                }
            });
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
                    'Portability': false,
                    'NewNumber': true
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
                "IdCurrentOperator": parseInt(customer.IdCurrentOperator),
                "Adresses": customer.Adresses,
                "Phones": customer.Phones,
                "Images": customer.Images,
                "IdParent": customer.IdParent,
                "IdContactParent": parseInt(clearPhoneNumber(customer.IdContactParent)),
                "NameContactParent": customer.NameContactParent,
                "IdCommissionLevel": customer.IdCommissionLevel,
                "SinglePrice": vm.singlePriceLocal,
                "DescriptionSinglePrice": customer.DescriptionSinglePrice
            }
            
            function filterPhones(number){
                return number.IsFoneclube == true;
            }

            validadeNumbers(customerSend.Phones.filter(filterPhones)).then(function(result) {
                var right = true;
                for (var item in result) {
                    if (result[item].DocumentNumber && result[item].DocumentNumber != vm.customer.DocumentNumber) {
                        showAlert('Aviso', 'Você não pode cadastrar o mesmo telefone para dois clientes.');
                        right = false;
                        vm.requesting = false;
                    }
                }
                if (right) {
                    for (var i in customerSend.Phones) {
                        customerSend.Phones[i].DDD = clearPhoneNumber(customerSend.Phones[i].DDD);
                        customerSend.Phones[i].Number = clearPhoneNumber(customerSend.Phones[i].Number);
                    }
                    FoneclubeService.postUpdateCustomer(customerSend)
                        .then(postUpdateCustomerSucess)
                        .catch(postUpdateCustomerError);
                }
            });
            
            function postUpdateCustomerSucess(result) {
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
            }
            
            function postUpdateCustomerError(error) {
                MainComponents.alert({mensagem:error.statusText});
                vm.requesting = false;
            }
        };
        
        function validadeNumbers(numbers){
            var promises = numbers.map(function(number) {
                return FoneclubeService.getCustomerByPhoneNumber({
                    ddd: clearPhoneNumber(number.DDD),
                    numero: clearPhoneNumber(number.Number)
                });
            });
            return $q.all(promises);
        }
        
        function setPlansList(operadora) {
            vm.selectedPlansList = [];
            for (var item in vm.plans) {
                if (operadora == 1 && vm.plans[item].Description.endsWith('VIVO')) {
                    vm.selectedPlansList.push(vm.plans[item]);
                } else if (operadora == 2 && vm.plans[item].Description.endsWith('CLARO')){
                    vm.selectedPlansList.push(vm.plans[item]);
                }
            }
        }
        
        function changeNumberPortabilty(item) {
            vm.customer.Phones[item].Portability = true;
            vm.customer.Phones[item].NewNumber = false;
        }
        
        function changeNumberNew(item) {
            vm.customer.Phones[item].Portability = false;
            vm.customer.Phones[item].NewNumber = true;
        }

        function clearPhoneNumber(number) {
            return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : '';
        }
        
        function validarCEP(index) {
            if (vm.customer.Adresses[index].Cep.length < 9) return;
            MainComponents.showLoader('Tentando preencher dados...');
            HubDevService.validaCEP(vm.customer.Adresses[index].Cep.replace(/[-.]/g , '')).then(function(result){
                if (!result.erro) {
                    vm.customer.Adresses[index].Street = result.logradouro;
                    vm.customer.Adresses[index].Neighborhood = result.bairro;
                    vm.customer.Adresses[index].City = result.localidade;
                    vm.customer.Adresses[index].State = result.uf;
                } else {
                    MainComponents.alert({mensagem: "CEP incorreto."});
                }
                MainComponents.hideLoader();
            }, function(error){
                MainComponents.hideLoader();
            });
        }
        
        function validarCPF () {
            if (vm.customer.DocumentNumber.length < 11) { return }
            FoneclubeService.getCustomerByCPF(vm.customer.DocumentNumber).then(function(existentClient){
                if (existentClient.Id == 0) {
                    HubDevService.validaCPF(vm.customer.DocumentNumber).then(function(result){
                        if(result.status){
                           vm.name = result.nome;
                        }
                    }, function(error){ });
                } else {
                    MainComponents.hideLoader();
                    var confirmPopup = $ionicPopup.confirm({
                        title: 'CPF já cadastrado',
                        template: 'Você não pode cadastrar um cpf repetido.',
                        buttons: [
                            {   text: '<b>Ok</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    return true;
                                }
                            }
                        ]
                    });
                    confirmPopup.then(function(res) {
                        vm.customer.DocumentNumber = angular.copy(vm.DocumentNumberFreeze);
                    });
                }
            }, function (result) {
                FlowManagerService.changeHomeView();
            }).catch(function (error) {
                FlowManagerService.changeHomeView();
            });
        }
        
        function changePhoneNumber(position) {
            if (vm.customer.Phones[position].DDD.length < 2 || vm.customer.Phones[position].Number.length < 9) {
                console.log('return');
                return
            }
            var param = {
                ddd: clearPhoneNumber(vm.customer.Phones[position].DDD),
                numero: clearPhoneNumber(vm.customer.Phones[position].Number)
            }
            FoneclubeService.getCustomerByPhoneNumber(param).then(function(res) {
                if (res.DocumentNumber && res.DocumentNumber != vm.customer.DocumentNumber) {
                    showAlert('Aviso', 'Este telefone já pertence a um cliente.');
                }
            });
        }
        
        function getContactParentName() {
            if (vm.customer.IdContactParent.length < 13) { return }
            var param = {
                ddd: clearPhoneNumber(vm.customer.IdContactParent).substring(0, 2),
                numero: clearPhoneNumber(vm.customer.IdContactParent).substring(2)
            }
            FoneclubeService.getCustomerByPhoneNumber(param).then(function(result) {
                vm.customer.NameContactParent = result.Name;
            })
        }
        
        function goBack() {
            FlowManagerService.goBack();
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                ViewModelUtilsService.showModalCustomer(result);
            });
        }
        
        //ToDo => colocar em uma service, ou utils
        function showAlert(title, message){
            return $ionicPopup.alert({
                title: title,
                template: message
            });
        }
    }
})();