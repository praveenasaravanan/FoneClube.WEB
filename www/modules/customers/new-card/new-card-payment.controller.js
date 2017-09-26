(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('NewCardPaymentModalController', NewCardPaymentModalController);

// <<<<<<< HEAD
    NewCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory'];
    function NewCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory) {
// =======
//     NewCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'MainUtils', 'FoneclubeService', 'UtilsService'];
//     function NewCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainComponents, MainUtils, FoneclubeService, UtilsService) {
// >>>>>>> release-branch

        var vm = this;
        var customer = ViewModelUtilsService.modalNewCardPaymentData;
        vm.customer = customer;
        var newCustomer;
        var cardData;
        var CARTAO = 1;
        
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
        vm.onTapCancel = onTapCancel;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;

        vm.etapaDados = true;

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
        
        vm.cardHolderName = '';
        vm.cardNumber = '';
        vm.cardExpirationMonth = '';
        vm.cardExpirationYear = '';
        vm.cardCVV = '';
        vm.amount = '';
        vm.statusTransaction = ''
        vm.comment = '';
        vm.cobrancaRealizada = false;
        if (vm.customer.CacheIn) {
            vm.amount = vm.customer.CacheIn;
        }

        console.log('NewCardPaymentModalController');

        newCustomer = {
                    'name' : customer.Name,
                    'document_number' : customer.DocumentNumber,
                    'email' : customer.Email,
                    'address' : getAddress(customer),
                    'phone' : getContactPhone(customer)
        }


        if(!customer.IdPagarme)
        {
            console.log('não tem conta no pagarme >>>');
            //não tem conta no pagarme ainda
        }
        else
        {
            //tem conta no pagarme
            //customer.IdPagarme
        }

        function onTapPagar(){
            cardData = getCardData();

             console.log("-----------------------")
             console.log(newCustomer)
             console.log(cardData)
             console.log(vm.amount);

            if(parseInt(vm.amount) < 100)
            {
                DialogFactory.showMessageDialog({mensagem:'Não é permitido cobranças a baixo de 1 Real', titulo: 'Aviso'});                            
                return;
            }

            paymentNewCustomer();
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
            if (!address || address.length == 0 ) {
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

        function getCardData(){
            var expirationMonth = vm.cardExpirationMonth;

            return {
                cardHolderName: vm.cardHolderName.toUpperCase(),
                cardExpirationMonth: expirationMonth,
                cardExpirationYear: vm.cardExpirationYear,
                cardNumber: vm.cardNumber,
                cardCVV:vm.cardCVV
            }
        }

        function paymentNewCustomer(){

            vm.disableTapPay = true;

            PagarmeService.generateCardHash(cardData).then(function(cardHash){

                vm.statusTransaction = 'Criptografando dados cartão';

                PagarmeService.postTransactionCard(vm.amount, cardHash, newCustomer)
                .then(function(result){


                    vm.statusTransaction = 'Transação em andamento';


                    PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){

                        vm.statusTransaction = 'Transação concluída';
                        vm.disableTapPay = false;
                        vm.cobrancaRealizada = true;  
                        saveHistoryPayment();
                    })
                    .catch(function(error){
                        try{        
                            DialogFactory.showMessageDialog({mensagem:'Erro na captura da transação' + error.status, titulo: 'Aviso'});                                                  

                        }
                        catch(erro){  
                            DialogFactory.showMessageDialog({mensagem:'Erro na captura da transação', titulo: 'Aviso'});                                                        
                        }
                        console.log(error);

                    });


                })
                .catch(function(error){
                    try{
                        console.log(error.data.errors)
                        vm.etapaDados = true;
                        vm.disableTapPay = false;
                        vm.etapaConfirmacao = false;
                        error.data.errors.forEach(function(erro) {
                            DialogFactory.showMessageDialog({mensagem:'Erro na transação: ' + erro.message, titulo: 'Aviso'});                              
                        }, this);

                    }
                    catch(erro){
                        vm.etapaDados = true;
                        vm.disableTapPay = false;
                        vm.etapaConfirmacao = false;
                        DialogFactory.showMessageDialog({mensagem:'Erro na transação', titulo: 'Aviso'});                                                      
                    }

                    console.log(error);
                });


            })
            .catch(function(error){
                var erro;
                for(var i in error)
                {

                    erro = error[i];
                }
                vm.etapaDados = true;
                vm.disableTapPay = false;
                vm.etapaConfirmacao = false;
                DialogFactory.showMessageDialog({mensagem:'Erro na transação '+ erro, titulo: 'Aviso'});                 

            });
        }

        function saveHistoryPayment(){

            try
            {
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
            catch(erro){

            }


        }
        
        function onTapPaymentHistoryDetail(history) {
            ViewModelUtilsService.showModalPaymentHistoryDetail(history, vm.customer);
        }


    }
})();