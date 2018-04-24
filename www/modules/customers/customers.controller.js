(function () {
    'use strict';

    angular
        .module('foneClub')
        .controller('CustomersController', CustomersController);

    // <<<<<<< HEAD
    CustomersController.inject = ['PagarmeService', 'DialogFactory', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', 'DataFactory', 'FlowManagerService'];
    function CustomersController(PagarmeService, DialogFactory, $scope, ViewModelUtilsService, FoneclubeService, MainUtils, DataFactory, FlowManagerService) {
        var vm = this;
        vm.data = DataFactory;
        vm.onTapCustomer = onTapCustomer;
        vm.onTapCustomerEdit = onTapCustomerEdit;
        vm.showLoader = true;
        vm.onTapRepeatLastCharge = onTapRepeatLastCharge;
        vm.onTapBoleto = onTapBoleto;
        vm.onTapBoletoPayment = onTapBoletoPayment;
        vm.onTapNewCardPayment = onTapNewCardPayment;
        vm.onTapExcluir = onTapExcluir;
        vm.CustomerAsc = CustomerAsc;
        vm.CustomerDesc = CustomerDesc;
        // =======
        //     CustomersController.inject = ['PagarmeService', '$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils', 'UtilsService'];
        //     function CustomersController(PagarmeService, $ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils, UtilsService) {
        //         var vm = this;
        //         vm.onTapCustomer = onTapCustomer;
        //         vm.showLoader = true;
        //         vm.clearDocumentField = clearDocumentField;
        //         vm.documentClear = '';

        //         console.log('=== Customers Controller Controller ===');
        // >>>>>>> release-branch
        vm.removeCaracteres = function () {  // no need of this filter as added replace in ignoreAccents filter below
            if (!vm.search)
                return;
            //alert(vm.search);
            //return vm.search;
            //return vm.search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~\s]/g, '');
            return vm.search.replace(/[-!#$%&'()*+,\/:;?\[\]\\\_`{|}~]/g, '');
        }

        vm.ignoreAccents = function (item) {
            //alert(item.Name);     
            if (!vm.search)
                return true;
            //alert(vm.showall);
            if (!vm.showall) {
                var text = removeAccents(item.Name.toLowerCase());
                //alert(text);
                var search = removeAccents(vm.search.toLowerCase()).replace(/[-!#$%&'()*+,\/:;?\[\]\\\_`{|}~]/g, '');
                return text.indexOf(search) > -1;
            }
            else {
                var objects = [];
                var jsonstr = JSON.stringify(item);
                var parsejson = JSON.parse(jsonstr);
                var searchterm = vm.search.replace(/\)\s/g,'').replace(/[-!#$%&'()*+,\/:;?\[\]\\\_`{|}~]/g, '');
                objects = getKeys(parsejson, searchterm);
                return objects.length > 0;
            }
        };

        //return an array of keys that match on a certain value
        function getKeys(obj, val) {
            var objects = [];
            for (var i in obj) {
                if (!obj.hasOwnProperty(i)) continue;
                if (typeof obj[i] == 'object') {
                    objects = objects.concat(getKeys(obj[i], val));
                } else if (obj[i] != null) {
                    //console.log(obj[i].toString().toLowerCase());
                    if (removeAccents(obj[i].toString().toLowerCase()).indexOf(removeAccents(val.toLowerCase())) > -1) {
                        objects.push(i);
                    }
                }
            }
            return objects;
        }

        //return an array of values that match on a certain key
        function getValues(obj, key) {
            var objects = [];
            for (var i in obj) {
                if (!obj.hasOwnProperty(i)) continue;
                if (typeof obj[i] == 'object') {
                    objects = objects.concat(getValues(obj[i], key));
                } else if (i == key) {
                    objects.push(obj[i]);
                }
            }
            return objects;
        }

        //return an array of objects according to key, value, or key and value matching
        function getObjects(obj, key, val) {
            var objects = [];
            for (var i in obj) {
                if (!obj.hasOwnProperty(i)) continue;
                if (typeof obj[i] == 'object') {
                    objects = objects.concat(getObjects(obj[i], key, val));
                } else
                    //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
                    if (i == key && obj[i] == val || i == key && val == '') { //
                        objects.push(obj);
                    } else if (obj[i] == val && key == '') {
                        //only add if the object is not already in the array
                        if (objects.lastIndexOf(obj) == -1) {
                            objects.push(obj);
                        }
                    }
            }
            return objects;
        }

        var getCustomers = $scope.$watch(function () {

            $scope.sortType = 'Nome';
            $scope.sortReverse = false;
            if (vm.data.customers !== undefined && $scope.clientList==undefined) {
                init();
            }
            $scope.clientList = vm.data.customers;

            return $scope.clientList;
        }, function (data) {
            if (data && data.length > 0) {
                vm.showLoader = false;
                getCustomers();
                if (vm.data.customersCache) {
                    vm.data.customers = angular.copy(vm.data.customersCache);
                    $scope.clientList = angular.copy(vm.data.customersCache);
                }
            }
        })
        $scope.sortType = 'Nome';
        $scope.sortReverse = false;
        $scope.clientList = vm.data.customers;




        console.log('=== Customers Controller Controller ===');
        // FoneclubeService.getCustomers().then(function(result){
        //     vm.showLoader = false;
        //     // vm.customers = result;
        //     vm.customers = result.map(function(user) {
        //         user.Phones = user.Phones.map(function(phone) {
        //             phone.phoneFull = phone.DDD.concat(phone.Number);
        //             return phone;
        //         })
        //         return user;
        //     })
        //     console.log('getCustomers')
        //     console.log(result)
        //     //post realizado com sucesso
        // })
        // .catch(function(error){
        //     console.log('catch error');
        //     console.log(error);
        //     console.log(error.statusText); // mensagem de erro para tela, caso precise
        // });

        function onTapCustomerEdit(customer, index) {
            FlowManagerService.changeEdicaoView(customer);
        }

        function onTapCustomer(customer, index) {
            console.log('customer')
            console.log(customer)
            ViewModelUtilsService.showModalCustomer(customer, index);
        }

        function clearDocumentField(documentNumber) {
            vm.documentClear = UtilsService.clearDocumentNumber(documentNumber);
        }

        function onTapNewCardPayment(customer) {
            console.log('onTapNewCardPayment');
            ViewModelUtilsService.showModalNewCardPayment(customer);
        }



        function onTapBoletoPayment(customer) {
            console.log('onTapBoleto')
            ViewModelUtilsService.showModalBoletoPayment(customer);
        }

        function onTapBoleto(customer) {
            console.log('onTapBoleto')
            ViewModelUtilsService.showModalBoleto(customer);
        }
        function onTapRepeatLastCharge(customer) {
            debugger;
            console.log('onTapRepeatLastCharge')
            FoneclubeService.getLastPaymentType(customer).then(function (result) {
                console.log(result);
                debugger;
                if (result["intIdPaymentType"] == 1) {
                    debugger;
                    /*ViewModelUtilsService.showModalRepeatBoleto(result,customer);*/
                    ViewModelUtilsService.showModalRepeatCard(result, customer);
                }
                /*else if(result["intIdPaymentType"]==1){
                    ViewModelUtilsService.showModalRepeatCard(result,customer);
                }
                else if(result["intIdPaymentType"]==3)
                    {
                        
                    }*/
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
                            console.log(result);
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

        function CustomerAsc(type) {
            if (type == 'Nome') {
                $scope.sortType = 'Name';
                $scope.sortReverse = false;
                $scope.clientList = vm.data.customers;
            } else if (type == 'Hist') {
                $scope.sortType = 'LastChargeDate';
                $scope.sortReverse = false;
                $scope.clientList = vm.data.customers.filter(x => x.LastChargeDate != null);
            } else {
                $scope.sortType = 'Register';
                $scope.sortReverse = false;
                $scope.clientList = vm.data.customers.filter(x => x.Register != null);
            }
            FoneclubeService.getPlans().then(function (result) {
                vm.plans = result;
            });
        }

        function CustomerDesc(type) {
            if (type == 'Nome') {
                $scope.sortType = '-Name';
                $scope.sortReverse = false;
                $scope.clientList = vm.data.customers;
            } else if (type == 'Hist') {
                $scope.sortType = '-LastChargeDate';
                $scope.sortReverse = false;
                $scope.clientList = vm.data.customers.filter(x => x.LastChargeDate != null);
            } else {
                $scope.sortType = '-Register';
                $scope.sortReverse = false;
                $scope.clientList = vm.data.customers.filter(x => x.Register != null);
            }
        }

        function init() {
            for(var i =0;i<vm.data.customers.length;i++){
                var customer = vm.data.customers[i];
                FoneclubeService.getHistoryPayment(customer.Id).then(function (result) {
                    console.log('FoneclubeService.getHistoryPayment');
                    console.log(result);
                    vm.histories = result;
                    var date = "sfsfsdf" ;
                    for (var i in vm.histories) {
                        var history = vm.histories[i];
                        
                    }
                    customer.datapgt = date;

                })
                    .catch(function (error) {
                        console.log('catch error');
                        console.log(error);
                    });
    
            }
        }

        
    }
})();
