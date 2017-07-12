(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('PaymentDetailController', PaymentDetailController);

    PaymentDetailController.inject = ['ViewModelUtilsService', 'MainComponents', 'MainUtils'];
    function PaymentDetailController(ViewModelUtilsService, MainComponents, MainUtils) {
        var vm = this;
        vm.customer = ViewModelUtilsService.modalPaymentDetailCustomer;
        vm.history = ViewModelUtilsService.modalPaymentDetailHistory;

    }
})();