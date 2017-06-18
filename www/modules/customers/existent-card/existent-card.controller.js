(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('ExistentCardPaymentModalController', ExistentCardPaymentModalController);

    ExistentCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'FoneclubeService', 'MainUtils'];
    function ExistentCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainComponents, FoneclubeService, MainUtils) {

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

        if (vm.customer.CacheIn) {
            vm.amount = vm.customer.CacheIn;
        }
        var existentCustomer = {
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
            PagarmeService.postTransactionExistentCard(vm.amount, card.id, existentCustomer)
             .then(function(result){

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
             })

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

    }
})();