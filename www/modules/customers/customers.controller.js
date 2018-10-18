(function () {
    'use strict';

    angular
        .module('foneClub')
        .controller('CustomersController', CustomersController);
    
  CustomersController.inject = ['PagarmeService', 'DialogFactory', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', 'DataFactory', 'FlowManagerService', 'localStorageService', '$templateCache', 'NgTableParams', '$state', '$rootScope', '$stateParams', 'UtilsService', 'ngTableDefaults'];
  function CustomersController(PagarmeService, DialogFactory, $scope, ViewModelUtilsService, FoneclubeService, MainUtils, DataFactory, FlowManagerService,localStorageService, $templateCache, NgTableParams, $state, $rootScope, $stateParams, UtilsService, ngTableDefaults) {

        console.log('=== Customers Controller ===');

        var vm = this;
        var checkvalidate = localStorageService.get("userid");

        vm.data = {};
        vm.onTapCustomer = onTapCustomer;
        vm.onTapCustomerEdit = onTapCustomerEdit;
        vm.onTapRepeatLastCharge = onTapRepeatLastCharge;
        vm.onTapBoleto = onTapBoleto;
        vm.onTapBoletoPayment = onTapBoletoPayment;
        vm.onTapNewCardPayment = onTapNewCardPayment;
        vm.onTapExcluir = onTapExcluir;
        vm.onDeleteCustomer = onDeleteCustomer;

        initialize();

        function initialize(){

            if (checkvalidate == null) {
                FlowManagerService.changeLoginView();
            }
    
            FoneclubeService.getAllCustomers(true).then(function (result) {
                
                vm.data.customers = result;
                var customersSemSoftDelete = [];
    
                for(var i in vm.data.customers) {
                    var customer = vm.data.customers[i];
                    if(!customer.SoftDelete)
                        customersSemSoftDelete.push(customer);
                }
                
                vm.tableParams = createUsingFullOptions(customersSemSoftDelete);
                vm.tableParams.reload();  
    
                FoneclubeService.getAllCustomers(false).then(function (result) {
                    
                    vm.data.customers = result.map(function (user) {
                            user.Phones = user.Phones.map(function (phone) {
                                phone.phoneFull = phone.DDD.concat(phone.Number);
                                return phone;
                            })
                            return user;
                        })
    
                    var customersSemSoftDelete = [];
                    for(var i in vm.data.customers) {
                        var customer = vm.data.customers[i];
                        if(!customer.SoftDelete)
                            customersSemSoftDelete.push(customer);
                    }

                    vm.tableParams = createUsingFullOptions(customersSemSoftDelete);
                    vm.tableParams.reload();  
                })
                
            })
        }
        
        $scope.$watch("vm.searchUser", function () {
            try{
                var search = vm.searchUser.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');
                var isnum = /^\d+$/.test(search.replace(' ', ''));
                
                if(isnum)
                    vm.searchIgnoreAccent = search.replace(' ', '');
                else    
                    vm.searchIgnoreAccent = search;
    
                vm.tableParams.filter({ $: vm.searchIgnoreAccent });
                vm.tableParams.reload();
            }
            catch(e){}
            
         });
        

        function onDeleteCustomer(customer){
            
                  var r = confirm("Deseja fazer um soft delete nesse cliente?");
                    if (r == true) {
            
                        FoneclubeService.postSoftDeleteCustomer(customer).then(function(result){

                            if(result)
                            {
                                alert('Cliente deletado');
                                customer.SoftDelete = true;
                            }
                            
                        }).catch(function (error) {
                                console.log(error);
                            });

                    } else {
                        txt = "You pressed Cancel!";
                    }
        }

        function createUsingFullOptions(lista) {
            var initialParams = {
              count: 50 // initial page size
            };
            var initialSettings = {
              // page size buttons (right set of buttons in demo)
              counts: [50,100,500],
              // determines the pager buttons (left set of buttons in demo)
              paginationMaxBlocks: 10,
              paginationMinBlocks: 1,
              dataset: lista
            };
            return new NgTableParams(initialParams, initialSettings);

          }

        //////////////////////////////////////////////////
        // Eventos de tap
        function onTapCustomerEdit(customer, index) {
            FlowManagerService.changeEdicaoView(customer);
        }

        function onTapCustomer(customer, index) {
            ViewModelUtilsService.showModalCustomer(customer, index);
        }

        function clearDocumentField(documentNumber) {
            vm.documentClear = UtilsService.clearDocumentNumber(documentNumber);
        }

        function onTapNewCardPayment(customer) {
            ViewModelUtilsService.showModalNewCardPayment(customer);
        }

        function onTapBoletoPayment(customer) {
            ViewModelUtilsService.showModalBoletoPayment(customer);
        }

        function onTapBoleto(customer) {
            ViewModelUtilsService.showModalBoleto(customer);
        }

        function onTapRepeatLastCharge(customer) {

            FoneclubeService.getLastPaymentType(customer).then(function (result) {

                if (result["intIdPaymentType"] == 1) {
                    ViewModelUtilsService.showModalRepeatCard(result, customer);
                }
            })
                .catch(function (error) {
                    console.log('catch error');
                    console.log(error);
                });
        }

        function onTapExcluir(customer) {
            var personCheckout = {
                'DocumentNumber': customer.DocumentNumber
            };
            DialogFactory.dialogConfirm({ mensagem: 'Atenção essa ação irá excluir o cliente da base foneclube, após exclusão não terá volta, deseja proseguir?' })
                .then(function (value) {
                    if (value) {
                        FoneclubeService.postDeletePerson(personCheckout).then(function (result) {
                            
                            if (result) {
                                DialogFactory.showMessageDialog({ message: 'Usuário foi removido com sucesso, no próximo carregamento da lista ele não será mais exibido' });
                                closeThisDialog(0);
                            }
                            else
                                DialogFactory.showMessageDialog({ message: 'Usuário não foi removido, guarde o documento dele: ' + customer.DocumentNumber });
                        })
                            .catch(function (error) {
                                console.log('catch error');
                                console.log(error);
                            });
                    }
                })
        }
    }
})();
