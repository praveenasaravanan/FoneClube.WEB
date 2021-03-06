(function() {
  'use strict';

  angular.module('foneClub').service('ViewModelUtilsService', ViewModelUtilsService);

  ViewModelUtilsService.inject = ['$ionicModal', 'DialogFactory'];
  function ViewModelUtilsService($ionicModal, DialogFactory) {
    //todo colocar cria~ção na hora do show garantindo sempre limpeza ao abrir
    this.modalCustomerData = {};
    this.showModalCustomer = showModalCustomer;
    this.showModalComment = showModalComment;
    this.showModalFlag = showModalFlag;

    this.modalNewCardPaymentData = {};
    this.showModalNewCardPayment = showModalNewCardPayment;

    this.modalExistentCardPaymentData = {};
    this.modalExistentCardData = {};
    this.showModalExistentCardPayment = showModalExistentCardPayment;
    this.showModalPaymentHistoryDetail = showModalPaymentHistoryDetail;

    this.modalData = {};
    this.showModal = showModal;

    this.modalBoletoData = {};
    this.modalRepeatBoletoData = {};

    this.modalCardData = {};
    this.modalRepeatCardData = {};
    this.showModalBoleto = showModalBoleto;
    this.showModalBoletoPayment = showModalBoletoPayment;
    this.showModalPIX = showModalPIX;
    this.showModalDebito = showModalDebito;

    this.showModalRepeatBoleto = showModalRepeatBoleto;
    this.showModalRepeatCard = showModalRepeatCard;
    this.showModalEmailDetail = showModalEmailDetail;
    this.showModalWhatsapp = showModalWhatsapp;

    function showModal(data) {
      this.modalData = data;
      var service = this;

      DialogFactory.showTemplate('modules/lista-customer/checkout-customer-modal.html');
    }

    function showModalCustomer(data, index) {
      this.modalCustomerData = data;
      this.modalCustomerData.index = index;
      var service = this;

      DialogFactory.showTemplate('modules/customers/customers-modal/customer-modal.html');
    }

    function showModalNewCardPayment(data) {
      this.modalNewCardPaymentData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/new-card/new-card-payment.html');
    }
    function showModalComment(data) {
      this.modalCommentData = data;
      var service = this;
      DialogFactory.showTemplate('modules/customers/comment/comment.html');
    }

    function showModalFlag(data){
      this.modalFlagData = data;
      var service = this;
      DialogFactory.showTemplate('modules/customers/flags-modal/flags.html');
    }

    function showModalExistentCardPayment(data, card) {
      this.modalExistentCardPaymentData = data;
      this.modalExistentCardData = card;
      var service = this;

      DialogFactory.showTemplate('modules/customers/existent-card/existent-card.html');
    }

    function showModalBoleto(data) {
      this.modalBoletoData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/boleto/boleto.html');
    }

    function showModalPIX(data) {
      this.modalBoletoData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/pix/pix.html');
    }

    function showModalDebito(data) {
      this.modalBoletoData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/debito/debito.html');
    }

    function showModalBoletoPayment(data) {
      this.modalBoletoData = data;
      var service = this;
      DialogFactory.showTemplate('modules/customers/boleto/boletopayment.html');
    }
    function showModalRepeatBoleto(payment, data) {
      // debugger;
      this.modalBoletoData = data;
      this.modalRepeatBoletoData = payment;
      var service = this;
      DialogFactory.showTemplate('modules/customers/repeat-boleto/repeat-boleto.html');
    }
    function showModalRepeatCard(payment, data) {
      // debugger;
      this.modalCardData = data;
      this.modalRepeatCardData = payment;
      var service = this;
      DialogFactory.showTemplate('modules/customers/repeat-card/repeat-card.html');
    }

    function showModalPaymentHistoryDetail(history, customer) {
      this.modalPaymentDetailHistory = history;
      this.modalPaymentDetailCustomer = customer;
      var service = this;
      DialogFactory.showTemplate('modules/customers/payment-detail/paymentdetail.html');
    }

    function showModalEmailDetail(emailstatus, phone, email, operator) {
      this.modalEmailDetailemailstatus = emailstatus;
      this.modalEmailDetailphone = phone;
      this.modalEmailDetailemail = email;
      this.modalEmailDetailoperator = operator;
      var service = this;
      DialogFactory.showTemplate('modules/customers/edicao/EmailTemplate.html');
    }

    function showModalWhatsapp(data) {
      this.modalData = data;
      var service = this;

      DialogFactory.showTemplate('modules/whatsapp/whatsapp.html');
    }

    this.showConfirmDialog = function(title, content) {
      return DialogFactory.dialogConfirm({
        titulo: title,
        mensagem: content
      });
    };
  }
})();
