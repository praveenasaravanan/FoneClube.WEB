(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('BoletoModalController', BoletoModalController);

// <<<<<<< HEAD
    BoletoModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory'];
    function BoletoModalController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory) {
// =======
//     BoletoModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'MainUtils', 'FoneclubeService', 'UtilsService'];
//     function BoletoModalController(ViewModelUtilsService, PagarmeService, MainComponents, MainUtils, FoneclubeService, UtilsService) {
// >>>>>>> release-branch

        var vm = this;
        var customer = ViewModelUtilsService.modalBoletoData;
        vm.customer = customer;
        var newCustomer;
        var BOLETO = 2;
        vm.etapaDados = true;
        vm.cobrancaRealizada = false;
        vm.amount = vm.customer.CacheIn ? vm.customer.CacheIn : '';
        vm.comment = '';
        console.log('BoletoModalController');
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
        vm.onTapCancel = onTapCancel;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;

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

            console.log('tap pagar boleto')
            console.log(parseInt(vm.amount))
            if(parseInt(vm.amount) < 100)
            {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Não é permitido cobranças a baixo de 1 Real'});                
                return;
            }

            vm.disableTapPay = true;
            vm.message = 'Iniciando transação';
            vm.instructions = 'FoneClub - 2017'
            PagarmeService.postBoleto(vm.amount, vm.instructions, existentCustomer)
             .then(function(result){
                console.log(result);
                 PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(resultCapture){
                        try{

                            PagarmeService.notifyCustomerBoleto(resultCapture.id, existentCustomer.email).then(function(resultNotify){
                            vm.message = 'Boleto gerado com sucesso'
                            vm.cobrancaRealizada = true;
                            vm.disableTapPay = false;
                                })
                                .catch(function(error){
                                try{
                                    vm.message = 'Boleto gerado com sucesso. Sem envio de notificação'
                                    vm.cobrancaRealizada = true;
                                    vm.disableTapPay = false;                                    
                                }
                                catch(erro){
                                    vm.message = 'Boleto gerado com sucesso. Sem envio de notificação'
                                    vm.cobrancaRealizada = true;
                                    vm.disableTapPay = false;                                    
                                }
                                console.log(error);

                            });

                        }
                        catch(erro){

                        }


                    saveHistoryPayment(resultCapture.id, resultCapture.acquirer_id);

                        vm.message = 'Boleto gerado com sucesso'
                    })
                    .catch(function(error){
                        try{
                            DialogFactory.showMessageDialog({mensagem: 'Erro na captura da transação' + error.status});                             
                        }
                        catch(erro){
                            DialogFactory.showMessageDialog({mensagem:'Erro na captura da transação'});                             
                        }
                        console.log(error);
                    });
            }, function (error) {
                UtilsService.showAlert('Aviso', 'Erro ao realizar transação, verifique os dados do cliente.');
                vm.disableTapPay = false;
            }).catch(function (error) {
                UtilsService.showAlert('Aviso', 'Erro ao realizar transação, verifique os dados do cliente.');
                vm.disableTapPay = false;
            });

        }

        function saveHistoryPayment(idBoleto, acquirer_id){

            var customerCharging = {
                Id: vm.customer.Id,
                Charging:{
                    Comment:vm.comment,
                    Ammount: vm.amount,
                    CollectorName: MainUtils.getAgent(),
                    PaymentType: BOLETO,
                    BoletoId: idBoleto,
                    AcquireId: acquirer_id
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
            if (!contacts || contacts.length == 0  || contacts[0].DDD == '' || contacts[0].Number == '') {
                UtilsService.showAlert('Aviso', 'É necessário cadastrar Telefone de Contato para este cliente.');
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
                UtilsService.showAlert('Aviso', 'É necessário cadastrar um Endereço para este cliente.');
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