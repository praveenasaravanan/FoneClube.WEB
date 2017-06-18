(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('BoletoModalController', BoletoModalController);

    BoletoModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'MainUtils', 'FoneclubeService'];
    function BoletoModalController(ViewModelUtilsService, PagarmeService, MainComponents, MainUtils, FoneclubeService) {

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

            console.log('tap pagar boleto')
            console.log(parseInt(vm.amount))
            if(parseInt(vm.amount) < 100)
            {
                MainComponents.showSimpleToast('Não é permitido cobranças a baixo de 1 Real', 'Aviso');
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
                                    //MainComponents.alert({mensagem:'Erro na notificação do boleto' + error.status});
                                }
                                catch(erro){
                                    vm.message = 'Boleto gerado com sucesso. Sem envio de notificação'
                                    vm.cobrancaRealizada = true;
                                    vm.disableTapPay = false;
                                    //MainComponents.alert({mensagem:'Erro na notificação do boleto'});
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
                            MainComponents.alert({mensagem:'Erro na captura da transação' + error.status});
                        }
                        catch(erro){
                            MainComponents.alert({mensagem:'Erro na captura da transação'});
                        }
                        console.log(error);

                    });


             })

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