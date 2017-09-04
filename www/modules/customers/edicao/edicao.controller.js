(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('EdicaoController', EdicaoController);

    EdicaoController.inject = ['$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils', '$stateParams', 'FlowManagerService', '$timeout', 'HubDevService', '$q', '$ionicScrollDelegate'];
    function EdicaoController($ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils, $stateParams, FlowManagerService, $timeout, HubDevService, $q, $ionicScrollDelegate) {
        var vm = this;
        vm.onTapSendUser = onTapSendUser;
        vm.onTapRemoveNewNumber = onTapRemoveNewNumber;
        vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
        vm.validarCEP = validarCEP;
        vm.validarCPF = validarCPF;
        vm.validatePhoneNumber = validatePhoneNumber;
        vm.getContactParentName = getContactParentName;
        vm.showAddNewPhone = showAddNewPhone;
        vm.goBack = goBack;
        
        vm.singlePriceLocal = 0;
        vm.allOperatorOptions = MainUtils.operatorOptions();
        vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '48716359615';
        vm.requesting = true;
        
        init();
        function init(){
            if (!vm.cpf) {
                FlowManagerService.changeCustomersView();
                return;
            }
            MainComponents.showLoader('Carregando dados...');
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                vm.DocumentNumberFreeze = result.DocumentNumber;
                vm.customer = result;
                vm.customer.Born = vm.customer.Born ? getFormatedDate(vm.customer.Born) : ''; //formata data de nasicmento
                getPersonParent(vm.customer.IdContactParent); //ToDo falta ajustar a API para devolver o id do cliente parent;
                vm.singlePriceLocal = vm.customer.SinglePrice ? vm.customer.SinglePrice : 0; //single place formatado;
                if (vm.customer.Adresses) {
                    for(var i=0; i < vm.customer.Adresses.length;i++) {
                        vm.customer.Adresses[i].StreetNumber = parseInt(vm.customer.Adresses[i].StreetNumber); //deve ser int por causa da mascara
                    }    
                }
                FoneclubeService.getPlans().then(function(result){
                    vm.plans = result;
                    for(var number in vm.customer.Phones) {
                        vm.customer.Phones[number].key = Math.random();
                        vm.customer.Phones[number].IdOperator = vm.customer.Phones[number].IdOperator.toString(); //deve ser string por causa do ng-options
                        vm.customer.Phones[number].IdPlanOption = vm.customer.Phones[number].IdPlanOption.toString(); //deve ser string por causa do ng-options
                        if (vm.customer.Phones[number].Portability) {
                            vm.customer.Phones[number].Portability = 'true';
                        } else {
                            vm.customer.Phones[number].Portability = 'false';   
                        }
                        vm.customer.Phones[number].NovoFormatoNumero = getNumberString(vm.customer.Phones[number]); //popula o novo campo vm.<telefone>
                        for (var plan in vm.plans) {
                            if (vm.plans[plan].Id == vm.customer.Phones[number].IdPlanOption) {
                                if (vm.plans[plan].Description.endsWith('VIVO')) {
                                    vm.customer.Phones[number].operadora = '1'; //seta a operadora local
                                } else {
                                    vm.customer.Phones[number].operadora = '2'; //seta a operadora local
                                }
                            }
                        }
                    }
                    console.info(vm.customer);
                    MainComponents.hideLoader();
                    $timeout(function () {
                        vm.requesting = false;
                    }, 2000)
                });
            });
        };
        
        function ajustaDados() {

            console.log(vm.customer); //log :D
        }
        
        function getPersonParent(id) {
            if (id) {
                FoneclubeService.getCustomerById(id).then(function (result) {
                    if (result.Phones.length > 0) {
                        vm.contactParent = result.Phones[0].DDD.concat(result.Phones[0].Number); 
                    }
                }).catch(function (error) {
                    console.log('error: ' + error);
                });
            }
        }

        function getFormatedDate(param) {
            var date = new Date(param);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            if (day < 10) {day = "0" + day;}
            if (month < 10) {month = "0" + month;}
            return day + '/' + month + '/' + year;
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
                "Adresses": customer.Adresses,
                "Phones": customer.Phones,
                "Images": customer.Images,
                "IdParent": customer.IdParent,
                "IdContactParent": customer.IdContactParent,
                "NameContactParent": customer.NameContactParent,
                "IdCommissionLevel": customer.IdCommissionLevel,
                "SinglePrice": vm.singlePriceLocal,
                "DescriptionSinglePrice": customer.DescriptionSinglePrice
            }
            
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
                    MainComponents.alert({mensagem:'Preço único não pode ser maior do que o preço de todos os planos somados.'});
                    return;
                }
            }
            
            //Regra: o telefone não pode ser incompleto, mass pode estar em branco
            for (var item in customerSend.Phones) {
                if (customerSend.Phones[item].NovoFormatoNumero.length < 14 && customerSend.Phones[item].NovoFormatoNumero.length > 0) {
                    showAlert('Aviso', 'O telefone: '.concat(customerSend.Phones[item].NovoFormatoNumero).concat(', não pode ficar incompleto, mas pode ficar em branco.'));
                    vm.requesting = false;
                    return;
                } else {
                    customerSend.Phones[item].DDD = getNumberJson(customerSend.Phones[item].NovoFormatoNumero).DDD;
                    customerSend.Phones[item].Number = getNumberJson(customerSend.Phones[item].NovoFormatoNumero).Number;
                }
            }
            
            var arrayFiltered = customerSend.Phones.filter(function (number) {
                return number.IsFoneclube == true && number.DDD.length == 2 && number.Number.length >= 9;
            });
            
            if (arrayFiltered.length == 0) {
                runPostUpdateCustomer(customerSend);
            } else {
                validadeNumbers(arrayFiltered).then(function(result) {
                    var right = true;
                    for (var item in result) {
                        if (result[item].DocumentNumber && result[item].DocumentNumber != vm.customer.DocumentNumber) {
                            showAlert('Aviso', 'Você não pode cadastrar o mesmo telefone para dois clientes.');
                            right = false;
                            vm.requesting = false;
                        }
                    }
                    if (right) {
                        runPostUpdateCustomer(customerSend);
                    }
                });
            }
            
            function runPostUpdateCustomer(customerSend) {
                FoneclubeService.postUpdateCustomer(customerSend)
                    .then(postUpdateCustomerSucess)
                    .catch(postUpdateCustomerError);
            }
            
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
        
        function getContactParentName() {
            if (vm.contactParent.length < 13) { 
                vm.customer.IdParent = "";
                return
            }
            var param = {
                ddd: clearPhoneNumber(vm.contactParent).substring(0, 2),
                numero: clearPhoneNumber(vm.contactParent).substring(2)
            }
            FoneclubeService.getCustomerByPhoneNumber(param).then(function(result) {
                vm.customer.IdParent = result.Id;
                vm.customer.NameContactParent = result.Name;
            })
        }
        
        function onTapNewPhoneNumber() {
            vm.customer.Phones.push(
                {
                    'Id': null,
                    'DDD': '',
                    'Number': '',
                    'IsFoneclube': true,
                    'IdOperator': 0,
                    'Portability': 'false',
                    'NickName': '',
                    'IdPlanOption': 0,
                    'Inative': false,
                    'Delete': false,
                    'NovoFormatoNumero': '',
                    'operadora': '1',
                    'key' : Math.random()
                }
            );
            resizeScroll();
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
        
        function validadeNumbers(numbers){
            var promises = numbers.map(function(number) {
                return FoneclubeService.getCustomerByPhoneNumber({
                    ddd: clearPhoneNumber(number.DDD),
                    numero: clearPhoneNumber(number.Number)
                });
            });
            return $q.all(promises);
        }
        
        function validatePhoneNumber(position) {
            if (vm.requesting || vm.customer.Phones[position].NovoFormatoNumero.length < 14) return;
            var number = {
                ddd: getNumberJson(vm.customer.Phones[position].NovoFormatoNumero).DDD,
                numero: getNumberJson(vm.customer.Phones[position].NovoFormatoNumero).Number
            }
            FoneclubeService.getCustomerByPhoneNumber(number).then(function(res) {
                if (res.DocumentNumber && res.DocumentNumber != clearDocumentNumber(vm.customer.DocumentNumber)) {
                    showAlert('Aviso', 'Este telefone já pertence a um cliente.');
                }
            });
        }
        
        function getNumberJson(param) {
            var number = {
                DDD: clearPhoneNumber(param).substring(0, 2),
                Number: clearPhoneNumber(param).substring(2)
            }
            return number;
        }
        
        function getNumberString(param) {
            return param.DDD.concat(param.Number);
        }
        
        function clearPhoneNumber(number) {
            return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : '';
        }
        
        function clearDocumentNumber(documentNumber){
            return documentNumber.replace(/[-.]/g, '');
        }
        
        function showAddNewPhone() {
            function filterPhones(number) {
                return number.IsFoneclube == true;
            }
            return vm.customer.Phones.filter(filterPhones);
        }
        
        function goBack() {
            FlowManagerService.goBack();
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                ViewModelUtilsService.showModalCustomer(result);
            });
        }
        
        function resizeScroll() {
            $ionicScrollDelegate.resize();
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