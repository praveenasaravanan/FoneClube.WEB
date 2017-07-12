(function() {
'use strict';

    angular
        .module('foneClub')
        .service('ViewModelUtilsService', ViewModelUtilsService);

    ViewModelUtilsService.inject = ['$ionicModal'];
    function ViewModelUtilsService($ionicModal) {


        //todo colocar cria~ção na hora do show garantindo sempre limpeza ao abrir
        this.modalCustomerData = {};
        this.showModalCustomer = showModalCustomer;

        this.modalNewCardPaymentData = {};
        this.showModalNewCardPayment = showModalNewCardPayment;

        this.modalExistentCardPaymentData = {};
        this.modalExistentCardData = {};
        this.showModalExistentCardPayment = showModalExistentCardPayment;
        this.showModalPaymentHistoryDetail = showModalPaymentHistoryDetail;

        this.modalData = {};
        this.showModal = showModal;

        this.modalBoletoData = {};
        this.showModalBoleto = showModalBoleto;

        function showModal(data){

            this.modalData = data;
            var service = this;

            $ionicModal.fromTemplateUrl('modules/lista-customer/checkout-customer-modal.html', {
                scope: null
            }).then(function(modal) {
                service.modal = modal;
                service.modal.show();
            });
        }

        function showModalCustomer(data){
            this.modalCustomerData = data;
            var service = this;

            $ionicModal.fromTemplateUrl('modules/customers/customers-modal/customer-modal.html', {
                scope: null
            }).then(function(modal) {
                service.modalCustomer = modal;
                service.modalCustomer.show();
            });
        }

        function showModalNewCardPayment(data){
            this.modalNewCardPaymentData = data;
            var service = this;

            $ionicModal.fromTemplateUrl('modules/customers/new-card/new-card-payment.html', {
                scope: null
            }).then(function(modal) {
                service.modalNewCardPayment = modal;
                service.modalNewCardPayment.show();
            });
        }

        function showModalExistentCardPayment(data,card){
            this.modalExistentCardPaymentData = data;
            this.modalExistentCardData = card;
            var service = this;

            $ionicModal.fromTemplateUrl('modules/customers/existent-card/existent-card.html', {
                scope: null
            }).then(function(modal) {
                service.modalExistentCardPayment = modal;
                service.modalExistentCardPayment.show();
            });
        }

       function showModalBoleto(data){
            this.modalBoletoData = data;           
            var service = this;

            $ionicModal.fromTemplateUrl('modules/customers/boleto/boleto.html', {
                scope: null
            }).then(function(modal) {
                service.modalBoleto = modal;
                service.modalBoleto.show();
            });
        }
        
        function showModalPaymentHistoryDetail(history, customer) {
            this.modalPaymentDetailHistory = history;
            this.modalPaymentDetailCustomer = customer;
            var service = this;

            $ionicModal.fromTemplateUrl('modules/customers/payment-detail/paymentdetail.html', {
                scope: null
            }).then(function(modal) {
                service.modalPaymentDetail = modal;
                service.modalPaymentDetail.show();
            });
        }

    }
})();