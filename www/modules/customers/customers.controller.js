(function () {
    'use strict';

    angular
        .module('foneClub')
        .controller('CustomersController', CustomersController);
    
  CustomersController.inject = ['PagarmeService', 'DialogFactory', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', 'DataFactory', 'FlowManagerService', 'localStorageService', '$templateCache', 'NgTableParams', '$state', '$rootScope', '$stateParams', 'UtilsService', 'ngTableDefaults'];
  function CustomersController(PagarmeService, DialogFactory, $scope, ViewModelUtilsService, FoneclubeService, MainUtils, DataFactory, FlowManagerService,localStorageService, $templateCache, NgTableParams, $state, $rootScope, $stateParams, UtilsService, ngTableDefaults) {

        // $state.reload();   
        console.log('=== Customers Controller ===' + $stateParams.previous);
        debugger
       
        if(UtilsService.getPreviousRouteData() == "tabs.edicao")
            window.location.reload(false); 

        var vm = this;
        var checkvalidate = localStorageService.get("userid");

        vm.onTapCustomer = onTapCustomer;
        vm.onTapCustomerEdit = onTapCustomerEdit;
        vm.onTapRepeatLastCharge = onTapRepeatLastCharge;
        vm.onTapBoleto = onTapBoleto;
        vm.onTapBoletoPayment = onTapBoletoPayment;
        vm.onTapNewCardPayment = onTapNewCardPayment;
        vm.onTapExcluir = onTapExcluir;
        vm.createUsingFullOptions = createUsingFullOptions;

        // vm.data = DataFactory;
        vm.data = {};
        vm.onDeleteCustomer = onDeleteCustomer;
        vm.showLoader = true;
        vm.changeSearch = changeSearch;
        vm.dataPgtList = [];

        // lixo de algum dev vida lok
        $scope.sortType = 'Nome';
        $scope.sortReverse = false;
        // $scope.clientList = vm.data.customers;
        
        vm.groups = [
            {
              title: "Dynamic Group Header - 1",
              content: "Dynamic Group Body - 1",
              open: false
            },
            {
              title: "Dynamic Group Header - 2",
              content: "Dynamic Group Body - 2",
              open: false
            }
          ];

        if (checkvalidate == null) {
          FlowManagerService.changeLoginView();
        }

        vm.data = {}
        FoneclubeService.getCustomers().then(function (result) {
                vm.data.customers = result.map(function (user) {
                    user.Phones = user.Phones.map(function (phone) {
                        phone.phoneFull = phone.DDD.concat(phone.Number);
                        return phone;
                    })
                    return user;
                })
                console.log('getCustomers')
                console.log(result)
                init()
                //post realizado com sucesso
            })
                .catch(function (error) {
                    console.log('catch error');
                    console.log(error);
                    console.log(error.statusText); // mensagem de erro para tela, caso precise
                });

        function init() {
            

            // debugger;
            
            for (var i = 0; i < vm.data.customers.length; i++) {
                var customer = vm.data.customers[i];

                
                if(customer.IdPagarme != undefined)
                {
                    FoneclubeService.getDataPgt(customer.IdPagarme).then(function (result) {
                        vm.dataPgtList.push(result);
                        if(vm.dataPgtList.length == vm.data.customers.length){
                            for (var j = 0; j < vm.data.customers.length; j++) {
                                vm.data.customers[j].dataPgt = vm.dataPgtList[j];
                            }
                            vm.clientList = vm.data.customers;
                            vm.showLoader = false;
                        }
                    })
                    .catch(function (error) {
                        console.log('catch error');
                        try{

                            vm.dataPgtList.push(null);
                            if(vm.dataPgtList.length == vm.data.customers.length){

                                for (var j = 0; j < vm.data.customers.length; j++) {
                                    vm.data.customers[j].dataPgt = vm.dataPgtList[j];
                                }
                                vm.clientList = vm.data.customers;
                                vm.showLoader = false;
                            }

                        }
                        catch(e){}
                    });
                
                }
                else{
                    try{

                        vm.dataPgtList.push(null);
                        if(vm.dataPgtList.length == vm.data.customers.length){

                            for (var j = 0; j < vm.data.customers.length; j++) {
                                vm.data.customers[j].dataPgt = vm.dataPgtList[j];
                            }
                            vm.clientList = vm.data.customers;
                            vm.showLoader = false;
                        }

                    }
                    catch(e){}
                }
            }

            vm.tableInitialized = true;

        }

        function changeSearch(){
            var search = vm.search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');
            var isnum = /^\d+$/.test(search.replace(' ', ''));
            
            if(isnum)
                vm.searchIgnoreAccent = search.replace(' ', '');
            else    
                vm.searchIgnoreAccent = search
        }

        var getCustomers = $scope.$watch(function () {
            
            $scope.sortType = 'Nome';
            $scope.sortReverse = false;
            vm.showLoader = false;
            if (vm.data.customers !== undefined && $scope.clientList == undefined) {
                vm.showLoader = true;
                init();
            }
            if(vm.data.customers !== undefined){
                if(vm.dataPgtList.length == vm.data.customers.length){
                    for (var j = 0; j < vm.data.customers.length; j++) {
                        vm.data.customers[j].dataPgt = vm.dataPgtList[j];
                    }
                }
            }
            $scope.clientList = vm.data.customers;
            
            if(vm.data.customers != undefined)
            {
                // debugger
                var customersSemSoftDelete = [];
                for(var i in vm.data.customers) {
                   var customer = vm.data.customers[i];
                   if(!customer.SoftDelete)
                    customersSemSoftDelete.push(customer);
               }
            

            //    vm.tableParams = new NgTableParams({
            //     counts: [100, 200, 300],
            //     sorting: { name: "asc" } 
            //     }, {
            //     dataset: customersSemSoftDelete
            //     });

            vm.tableParams = createUsingFullOptions(customersSemSoftDelete)

 
            }

            

                

            return $scope.clientList;

        }, function (data) {
            if (data && data.length > 0) {
                getCustomers();
                // if (vm.data.customersCache) {
                //     vm.data.customers = angular.copy(vm.data.customersCache);
                //     $scope.clientList = angular.copy(vm.data.customersCache);

                //     vm.tableParams = new NgTableParams({
                //         sorting: { name: "asc" } 
                //         }, {
                //         dataset: vm.data.customers
                //         });
                // }
            }
        })


        $scope.$watch("vm.searchUser", function () {

            try{
                var search = vm.searchUser.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');
                var isnum = /^\d+$/.test(search.replace(' ', ''));
                
                if(isnum)
                    vm.searchIgnoreAccent = search.replace(' ', '');
                else    
                    vm.searchIgnoreAccent = search;
    
                vm.tableParams.filter({ $: vm.searchIgnoreAccent });
                // vm.tableParams.filter({ DocumentNumber: vm.searchUser });
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

        /////////////////////////////
        /////////////////////////////


    }
})();
