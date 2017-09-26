(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('EdicaoController', EdicaoController);

    EdicaoController.inject = ['$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', '$stateParams', 'FlowManagerService', '$timeout', 'HubDevService', '$q', '$ionicScrollDelegate', 'UtilsService', 'DialogFactory'];
    function EdicaoController($scope, ViewModelUtilsService, FoneclubeService, MainUtils, $stateParams, FlowManagerService, $timeout, HubDevService, $q, $ionicScrollDelegate, UtilsService, DialogFactory) {
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
        vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '';
        vm.requesting = true;
        debugger;
        init();
        function init(){
            if (!vm.cpf) {
                FlowManagerService.changeCustomersView();
                return;
            }
            var showDialog = DialogFactory.showLoader('Carregando dados...');
            FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function(result){
                vm.DocumentNumberFreeze = angular.copy(result.DocumentNumber);
                vm.customer = result;
                vm.customer.Born = vm.customer.Born ? getFormatedDate(vm.customer.Born) : ''; //formata data de nasicmento
                getPersonParent(vm.customer.IdParent); //ToDo falta ajustar a API para devolver o id do cliente parent;
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
// <<<<<<< HEAD
                    showDialog.close();
// =======
                    //MainComponents.hideLoader();
                    
                    
                    // Fix caso não exista numero de telefone -- É necessário manter esse fix por causa de clientes que tenham esse array vazio
                    var dontHaveContact = vm.customer.Phones.filter(function (element, index, array) {
                        return element.IsFoneclube == null || element.IsFoneclube == false;
                    });
                    if (dontHaveContact.length == 0) {
                        vm.customer.Phones.push({
                            'Id': null,
                            'DDD': '',
                            'Number': '',
                            'IsFoneclube': null,
                            'IdOperator': 0,
                            'Portability': 'false',
                            'NickName': '',
                            'IdPlanOption': 0,
                            'Inative': false,
                            'Delete': false,
                            'NovoFormatoNumero': '',
                            'operadora': '1',
                            'key' : Math.random()
                        });
                    }
                    
                    // Fix caso não exista endereço -- É necessário manter esse fix por causa de clientes que tenham esse array vazio
                    if (vm.customer.Adresses.length == 0) {
                        vm.customer.Adresses.push({
                            Cep: '',
                            Street: '',
                            StreetNumber: '',
                            Complement: '',
                            Neighborhood: '',
                            City: '',
                            State: ''
                        });
                    }

// >>>>>>> release-branch
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
            if (vm.requesting == true) return;
            vm.requesting = true;
            var showLoader = DialogFactory.showLoader('Enviando Dados...');
            
            var customerSend = {
                "Id": customer.Id,
                "DocumentNumber": UtilsService.clearDocumentNumber(customer.DocumentNumber),
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
                    DialogFactory.showMessageDialog({mensagem:'Preço único não pode ser maior do que o preço de todos os planos somados.'});
                    showLoader.close();
                    vm.requesting = false;
                    return;
                }
            }
            
            //Regra: o telefone não pode ser incompleto, mass pode estar em branco
            for (var item in customerSend.Phones) {
                if (customerSend.Phones[item].NovoFormatoNumero.length < 14 && customerSend.Phones[item].NovoFormatoNumero.length > 0) {
                    DialogFactory.showMessageDialog({titulo:'Aviso', mensagem:'O telefone: '.concat(customerSend.Phones[item].NovoFormatoNumero).concat(', não pode ficar incompleto, mas pode ficar em branco.')});
                    showLoader.close();
                    vm.requesting = false;
                    return;
                } else {
                    customerSend.Phones[item].DDD = getNumberJson(customerSend.Phones[item].NovoFormatoNumero).DDD;
                    customerSend.Phones[item].Number = getNumberJson(customerSend.Phones[item].NovoFormatoNumero).Number;
                }
            }
            
            var arrayFiltered = customerSend.Phones.filter(function (number) {
                return number.IsFoneclube == true && number.DDD.length == 2 && number.Number.length >= 8 && number.Delete == null;
            });
            //Fix se o usuario não add CEP o array deve estar vazio;
            for(var i in customerSend.Adresses) {
                if (customerSend.Adresses[i].Cep == '')
                    customerSend.Adresses.splice(i, 1);
            }
            
            if (arrayFiltered.length == 0) {
                runPostUpdateCustomer(customerSend);
            } else {
                validadeNumbers(arrayFiltered).then(function(result) {
                    var right = true;
                    for (var item in result) {
// <<<<<<< HEAD
                        if (result[item].DocumentNumber && result[item].DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)) {
                            var msg = 'Você não pode cadastrar o mesmo telefone para dois clientes.</br>O número <strong>'
                                .concat(arrayFiltered[item].NovoFormatoNumero).concat('</strong>, pertence ao cliente ')
                                .concat(result[item].DocumentNumber).concat(', ').concat(result[item].Name).concat('.');
                            DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: msg});
// =======
//                         if (result[item].DocumentNumber && result[item].DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)) {                            
//                             showAlert('Aviso', 'Você não pode cadastrar o mesmo telefone para dois clientes.</br>O número <strong>'
//                                         .concat(arrayFiltered[item].NovoFormatoNumero).concat('</strong>, pertence ao cliente ')
//                                         .concat(result[item].DocumentNumber).concat(', ').concat(result[item].Name).concat('.'));
// >>>>>>> release-branch
                            right = false;
                            vm.requesting = false;
                            showLoader.close();
                        }
                    }
                    for(var x in arrayFiltered) {
                        //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
                        var twiceNumber = arrayFiltered.filter(function (element, index, array) {
                            return element.DDD == arrayFiltered[x].DDD && element.Number == arrayFiltered[x].Number;
                        });
                        if (twiceNumber.length > 1) {
                            DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.'});
                            right = false;
                            vm.requesting = false;
                            showLoader.close();
                            break;
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
                    DialogFactory.dialogConfirm({title:'Edição Realizada', mensagem: 'Todos os dados pessoais enviados, edição Foneclube feita com sucesso.', btn1: 'Ir para Home', btn2: 'Visualizar Cliente'})
                    .then(function(result) {
                        if(result) {
                            FlowManagerService.changeCustomersView();
                            FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function(result){
                                ViewModelUtilsService.showModalCustomer(result);
                            });
                        } else {
                            FlowManagerService.changeHomeView();
                        }
                    })                    
                }
                vm.requesting = false;
                showLoader.close();
            }
            
            function postUpdateCustomerError(error) {
                DialogFactory.showMessageDialog({mensagem:error.statusText});
                vm.requesting = false;
                showLoader.close();
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
            var showLoader = DialogFactory.showLoader('Tentando preencher dados...');
            HubDevService.validaCEP(vm.customer.Adresses[index].Cep.replace(/[-.]/g , '')).then(function(result){
                if (!result.erro) {
                    vm.customer.Adresses[index].Street = result.logradouro;
                    vm.customer.Adresses[index].Neighborhood = result.bairro;
                    vm.customer.Adresses[index].City = result.localidade;
                    vm.customer.Adresses[index].State = result.uf;
                } else {
                    DialogFactory.showMessageDialog({mensagem:"CEP incorreto."});
                }
                showLoader.close();
            }, function(error){
                showLoader.close();
            });
        }
        
        function validarCPF () {
            if (vm.customer.DocumentNumber.length < 11) { return }
            FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)).then(function(existentClient){
                if (existentClient.Id == 0) {
                    HubDevService.validaCPF(UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)).then(function(result){
                        if(result.status){
                           vm.name = result.nome;
                        }
                    }, function(error){ });
                } else if (existentClient.DocumentNumber != vm.DocumentNumberFreeze) {                    
                    DialogFactory.showMessageConfirm({titulo: 'CPF já cadastrado', mensagem: 'Você não pode cadastrar um cpf repetido.'})
                    .then(function(param) {
                        var cpf = angular.copy(vm.DocumentNumberFreeze);
                        vm.customer.DocumentNumber = cpf.substr(0, 3) + '.' + cpf.substr(3, 3) + '.' + cpf.substr(6, 3) + '-' + cpf.substr(9)
                    })                   
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
            DialogFactory.showMessageConfirm({titulo: 'Excluir Número', mensagem: 'Deseja realmente remover este número?'})
            .then(function(res){
                if(res) {
                    vm.customer.Phones[position].Delete = true;
                }
            })           
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
            //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
            var twiceNumber = vm.customer.Phones.filter(function (element, index, array) {
                return element.NovoFormatoNumero == vm.customer.Phones[position].NovoFormatoNumero 
                        && element.IsFoneclube == true
                        && element.Delete == null;
            });
            if (twiceNumber.length > 1) {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.'});
                return;
            }
            FoneclubeService.getCustomerByPhoneNumber(number).then(function(res) {
                if (res.DocumentNumber && res.DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)) {
                    DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Este telefone já pertence a um cliente.'});
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
                
    }
})();