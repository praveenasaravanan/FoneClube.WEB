(function() {
'use strict';

    angular
        .module('foneClub')
        .service('ViewModelUtilsService', ViewModelUtilsService);

    ViewModelUtilsService.inject = ['$ionicModal', 'DialogFactory'];
    function ViewModelUtilsService($ionicModal, DialogFactory) {


        //todo colocar cria~ção na hora do show garantindo sempre limpeza ao abrir
        this.modalCustomerData = {};        
        this.showModalCustomer = showModalCustomer;
        this.showModalComment=showModalComment;

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

            DialogFactory.showTemplate('modules/lista-customer/checkout-customer-modal.html');           
        }

        function showModalCustomer(data, index){
            this.modalCustomerData = data;
            this.modalCustomerData.index = index;
            var service = this;
        
            DialogFactory.showTemplate('modules/customers/customers-modal/customer-modal.html');
        }

        function showModalNewCardPayment(data){
            this.modalNewCardPaymentData = data;
            var service = this;
           
            DialogFactory.showTemplate('modules/customers/new-card/new-card-payment.html');
        }
        function showModalComment(data){        
            this.modalCommentData = data;
            var service = this;          
            DialogFactory.showTemplate('modules/customers/comment/comment.html');
        }
        
        

        function showModalExistentCardPayment(data,card){
            this.modalExistentCardPaymentData = data;
            this.modalExistentCardData = card;
            var service = this;

            DialogFactory.showTemplate('modules/customers/existent-card/existent-card.html');
        }

       function showModalBoleto(data){
            this.modalBoletoData = data;           
            var service = this;           

            DialogFactory.showTemplate('modules/customers/boleto/boleto.html');
        }
        
        function showModalPaymentHistoryDetail(history, customer) {
            this.modalPaymentDetailHistory = history;
            this.modalPaymentDetailCustomer = customer;
            var service = this;

            DialogFactory.showTemplate('modules/customers/payment-detail/paymentdetail.html');
        }

    }
})();