(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('NewCardPaymentModalController', NewCardPaymentModalController);

    NewCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'MainUtils', 'FoneclubeService'];
    function NewCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainComponents, MainUtils, FoneclubeService) {

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
                    'address' : {
                        'street' : customer.Adresses[0].Street,
                        'street_number' : customer.Adresses[0].StreetNumber,
                        'neighborhood' : customer.Adresses[0].Neighborhood,
                        'zipcode' : customer.Adresses[0].Cep,
                        'city': customer.Adresses[0].City,
                        'uf': customer.Adresses[0].State

                    },
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
                MainComponents.showSimpleToast('Não é permitido cobranças a baixo de 1 Real', 'Aviso');
                return;
            }

            paymentNewCustomer();
        }

        function getContactPhone(customer){
            for(var i in customer.Phones)
            {
                var phone = customer.Phones[i];
                if(!phone.IsFoneclube)
                {
                    return {
                        'ddd' : phone.DDD.toString(),
                        'number' : phone.Number.toString()
                    };
                }

            }

            if(!contactPhone)
            {
                for(var i in customer.Phones)
                {
                    var phone = customer.Phones[i];

                    return {
                        'ddd' : phone.DDD.toString(),
                        'number' : phone.Number.toString()
                    };

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
                            MainComponents.showSimpleToast('Erro na captura da transação' + error.status, 'Aviso');

                        }
                        catch(erro){                            
                            MainComponents.showSimpleToast('Erro na captura da transação', 'Aviso');
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
                            MainComponents.showSimpleToast('Erro na transação: ' + erro.message, 'Aviso');
                        }, this);

                    }
                    catch(erro){
                        vm.etapaDados = true;
                        vm.disableTapPay = false;
                        vm.etapaConfirmacao = false;
                        MainComponents.showSimpleToast('Erro na transação', 'Aviso');
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
                MainComponents.showSimpleToast('Erro na transação'+ erro, 'Aviso');

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