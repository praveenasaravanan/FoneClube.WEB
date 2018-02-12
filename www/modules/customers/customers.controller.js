(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CustomersController', CustomersController);

// <<<<<<< HEAD
    CustomersController.inject = ['PagarmeService', 'DialogFactory', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', 'DataFactory'];
    function CustomersController(PagarmeService, DialogFactory, $scope, ViewModelUtilsService, FoneclubeService, MainUtils, DataFactory) {
        var vm = this;
        vm.data = DataFactory;
        vm.onTapCustomer = onTapCustomer;
        vm.showLoader = true;
        vm.onTapRepeatLastCharge=onTapRepeatLastCharge;
        vm.onTapBoleto = onTapBoleto;
        vm.onTapNewCardPayment = onTapNewCardPayment;
        vm.onTapExcluir = onTapExcluir;
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
        vm.removeCaracteres = function() {
            if (!vm.search)
                return;
            //return vm.search;
            //return vm.search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~\s]/g, '');
            return vm.search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');
        }

        var getCustomers = $scope.$watch(function() {
            return vm.data.customers;
        }, function(data) {
            if(data && data.length > 0) {
                vm.showLoader = false;
                getCustomers();
                if (vm.data.customersCache) {
                    vm.data.customers = angular.copy(vm.data.customersCache);
                }
            }
        })



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

        function onTapCustomer(customer, index){
            console.log('customer')
            console.log(customer)
            ViewModelUtilsService.showModalCustomer(customer, index);
        }

        function clearDocumentField(documentNumber) {
            vm.documentClear =  UtilsService.clearDocumentNumber(documentNumber);
        }

        function onTapNewCardPayment(customer){
            console.log('onTapNewCardPayment');
            ViewModelUtilsService.showModalNewCardPayment(customer);
        }

        function onTapBoleto(customer){
          console.log('onTapBoleto')
          ViewModelUtilsService.showModalBoleto(customer);
        }
        function onTapRepeatLastCharge(customer){
            debugger;
            console.log('onTapRepeatLastCharge')
            FoneclubeService.getLastPaymentType(customer).then(function(result){
                console.log(result);
                debugger;
                if(result["intIdPaymentType"]==1){
                    debugger;
                    /*ViewModelUtilsService.showModalRepeatBoleto(result,customer);*/
                    ViewModelUtilsService.showModalRepeatCard(result,customer);
                }
                /*else if(result["intIdPaymentType"]==1){
                    ViewModelUtilsService.showModalRepeatCard(result,customer);
                }
                else if(result["intIdPaymentType"]==3)
                    {
                        
                    }*/
            })
            .catch(function(error){
                      console.log('catch error');
                      console.log(error);
                  });
        }

        function onTapExcluir(customer){
          var personCheckout = {
              'DocumentNumber': customer.DocumentNumber
          };
          DialogFactory.dialogConfirm({mensagem: 'Atenção essa ação irá excluir o cliente da base foneclube, após exclusão não terá volta, deseja proseguir?'})
          .then(function(value) {
              if(value) {
                  FoneclubeService.postDeletePerson(personCheckout).then(function(result){
                      console.log(result);
                      if(result){
                          DialogFactory.showMessageDialog({message: 'Usuário foi removido com sucesso, no próximo carregamento da lista ele não será mais exibido'});
                          closeThisDialog(0);
                      }
                      else
                          DialogFactory.showMessageDialog({message: 'Usuário não foi removido, guarde o documento dele: ' + customer.DocumentNumber});
                  })
                  .catch(function(error){
                      console.log('catch error');
                      console.log(error);
                  });
              }
          })
        }


    }
})();
