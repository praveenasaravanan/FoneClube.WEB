(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('ExistentCardPaymentModalController', ExistentCardPaymentModalController);

    ExistentCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'FoneclubeService', 'MainUtils', 'UtilsService', '$scope', 'DialogFactory'];
    function ExistentCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainComponents, FoneclubeService, MainUtils, UtilsService, $scope, DialogFactory) {

        var vm = this;
        vm.etapaDados = true;
        var customer = ViewModelUtilsService.modalExistentCardPaymentData;
        var card = ViewModelUtilsService.modalExistentCardData;
        vm.customer = customer;
        vm.card = card;
        console.log(vm.card)
        var newCustomer;
        var cardData;
        var CARTAO = 1;
        vm.amount = '';
        vm.comment = '';
        vm.cobrancaRealizada = false;
        console.log('ExistentCardPaymentModalController');
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
        vm.onTapCancel = onTapCancel;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;

        if (vm.customer.CacheIn) {
            vm.amount = vm.customer.CacheIn;
        }
        
        var existentCustomer = {
            'name' : customer.Name,
            'document_number' : customer.DocumentNumber,
            'email' : customer.Email,
            'address' : getAddress(customer),
            'phone' : getContactPhone(customer)
        }

        function onTapConfirmarPagamento() {
            if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                return;
            }
            vm.etapaDados = false;
            vm.etapaConfirmacao = true;
        }
        
        function onTapCancel(number){
            vm.etapaDados = true;
            vm.etapaConfirmacao = false;
            if (number == 1){
                vm.amount = 0;
                vm.comment = '';
                vm.cobrancaRealizada = false;   
            }
        }

        function onTapPagar(){
            console.log('tap pagar existente')
            console.log(parseInt(vm.amount))
            console.log(card.id)
            if(parseInt(vm.amount) < 100)
            {
                MainComponents.showSimpleToast('Não é permitido cobranças a baixo de 1 Real', 'Aviso');
                return;
            }

            vm.disableTapPay = true;
            vm.message = 'Iniciando transação';
            PagarmeService.postTransactionExistentCard(vm.amount, card.id, existentCustomer).then(function(result){
                vm.message = 'Transação efetuada';
                PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){
                        vm.message = 'Transação concluída';
                        saveHistoryPayment();
                        vm.disableTapPay = false;
                        vm.cobrancaRealizada = true;                        
                    })
                    .catch(function(error){
                        vm.disableTapPay = false;
                        try{
                            vm.message = 'Erro na captura da transação' + error.status;
                        }
                        catch(erro){
                            vm.message = 'Erro na captura da transação'
                        }
                        console.log(error);
                    });
             }, function(error) {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                vm.disableTapPay = false;
            }).catch(function (error) {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                vm.disableTapPay = false;
            });
        }

        function saveHistoryPayment(){
            console.log('saveHistoryPayment');
            console.log(MainUtils.getAgent());
            console.log(vm.comment);
            //vm.comment
            var customerCharging = {
                Id: vm.customer.Id,
                Charging:{
                    Comment:vm.comment,
                    Ammount: vm.amount,
                    CollectorName: MainUtils.getAgent(),
                    PaymentType: CARTAO
                }
            }
            FoneclubeService.postHistoryPayment(customerCharging).then(function(result){
                console.log('FoneclubeService.postHistoryPayment');
                console.log(result);
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
            });

        }

        function getContactPhone(customer){
            var contacts = UtilsService.getContactPhoneFromPhones(customer.Phones);
            if (!contacts || contacts.length == 0 || contacts[0].DDD == '' || contacts[0].Number == '') {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'É necessário cadastrar Telefone de Contato para este cliente.'});
                return null;
            } else {
                return {
                    'ddd' : contacts[0].DDD.toString(),
                    'number' : contacts[0].Number.toString()
                }
            }
        }
        
        function getAddress(customer) {
            var address = customer.Adresses;
            if (!address || address.length == 0) {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'É necessário cadastrar um Endereço para este cliente.'});
                return null;
            } else {
                return {
                    'street' : address[0].Street,
                    'street_number' : address[0].StreetNumber,
                    'neighborhood' : address[0].Neighborhood,
                    'zipcode' : address[0].Cep,
                    'city': address[0].City,
                    'uf': address[0].State
                }
            }
        }
        
        function onTapPaymentHistoryDetail(history) {
            ViewModelUtilsService.showModalPaymentHistoryDetail(history, vm.customer);
        }

    }
})();