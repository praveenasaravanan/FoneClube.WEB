(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CustomersController', CustomersController);

    CustomersController.inject = ['PagarmeService', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils'];
    function CustomersController(PagarmeService, $scope, ViewModelUtilsService, FoneclubeService, MainUtils) {
        var vm = this;
        vm.onTapCustomer = onTapCustomer;
        vm.showLoader = true;        

        console.log('=== Customers Controller Controller ===');       
        FoneclubeService.getCustomers().then(function(result){
            vm.showLoader = false;
            vm.customers = result;
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


    }
})();