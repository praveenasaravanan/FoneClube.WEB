(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CustomersController', CustomersController);

// <<<<<<< HEAD
    CustomersController.inject = ['PagarmeService', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils'];
    function CustomersController(PagarmeService, $scope, ViewModelUtilsService, FoneclubeService, MainUtils) {
        var vm = this;
        vm.onTapCustomer = onTapCustomer;
        vm.showLoader = true;        
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
            return vm.search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');
        }
        console.log('=== Customers Controller Controller ===');       
        FoneclubeService.getCustomers().then(function(result){
            vm.showLoader = false;
            // vm.customers = result;
            vm.customers = result.map(function(user) {
                user.Phones = user.Phones.map(function(phone) {
                    return phone.phoneFull = phone.DDD.concat(phone.Number);
                })
                return user;
            })
            console.log('getCustomers')
            console.log(result)
            //post realizado com sucesso
        })
        .catch(function(error){
            console.log('catch error');
            console.log(error);
            console.log(error.statusText); // mensagem de erro para tela, caso precise
        });

        function onTapCustomer(customer){
            console.log('customer')
            console.log(customer)
            ViewModelUtilsService.showModalCustomer(customer);
        }
        
        function clearDocumentField(documentNumber) {
            vm.documentClear =  UtilsService.clearDocumentNumber(documentNumber);
        }


    }
})();