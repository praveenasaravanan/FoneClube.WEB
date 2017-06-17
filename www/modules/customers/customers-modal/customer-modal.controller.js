(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CustomerModalController', CustomerModalController);

    CustomerModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'FoneclubeService', 'MainComponents'];
    function CustomerModalController(ViewModelUtilsService, PagarmeService, FoneclubeService, MainComponents) {
        var vm = this;
        vm.onTapNewCardPayment = onTapNewCardPayment;
        vm.onTapBoleto = onTapBoleto;
        vm.onTapCard = onTapCard;
        vm.onTapExcluir = onTapExcluir;

        var customer = ViewModelUtilsService.modalCustomerData;
        vm.customer = customer;
        var CARTAO = 1;
        var BOLETO = 2;
        console.log('customer modal controller')
        console.log(customer);

        init();


        function init(){
            if(!customer.IdPagarme)
            {

                PagarmeService.getCustomer(customer.DocumentNumber)
                .then(function(result){
                    console.log('- get customer')
                    console.log(result)


                    try{
                        var pagarmeID = result[0].id;
                        updatePagarmeId(pagarmeID);
                        initCardList(pagarmeID);
                        etapaEscolhaCartao();
                    }
                    catch(erro){
                        console.log('cliente sem id pagarme ainda')
                    }
                    /*
                    var pagarmeID = result[0].id;
                    updatePagarmeId(pagarmeID);
                    initCardList(pagarmeID);
                    etapaEscolhaCartao();
                    */

                })
                .catch(function(error){
                    console.log(error);

                });


            }
            else
            {
                etapaEscolhaCartao();
                initCardList(customer.IdPagarme);
            }

            FoneclubeService.getHistoryPayment(customer.Id).then(function(result){
                console.log('FoneclubeService.getHistoryPayment');
                console.log(result);
                vm.histories = result;
                for(var i in vm.histories)
                {
                    var history = vm.histories[i];
                    history.descriptionType = (history.PaymentType == CARTAO) ? 'Cartão de crédito' : 'Boleto';

                    if(history.PaymentType == BOLETO)
                    {
                        setStatusBoleto(history);
                    }
                }
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
            });
        }

        function onTapExcluir(){
            //alert('Atenção essa ação irá excluir o cliente da base foneclube, após exclusão não terá volta.');
            var personCheckout = {
                    'DocumentNumber': customer.DocumentNumber
                };

            if (confirm('Atenção essa ação irá excluir o cliente da base foneclube, após exclusão não terá volta, deseja proseguir?')) {
                FoneclubeService.postDeletePerson(personCheckout).then(function(result){
                    console.log(result);
                })
                .catch(function(error){
                    console.log('catch error');
                    console.log(error);
                });
            } else {
            // Do nothing!
            }

            //MainComponents.infoAlert({mensagem:'Atenção essa ação irá excluir o cliente da base foneclube, após exclusão não terá volta.'});
            //MainComponents.alert({titulo:'Andamento',mensagem:'Documento enviado, agora preencha os dados de Endereço.'});
        }

        function setStatusBoleto(history){
            console.log('setStatusBoleto')
            console.log(history)
            PagarmeService.getStatusBoleto(history.BoletoId).then(function(result){
               history.StatusPayment = result[0].status;
            })
        }

        function updatePagarmeId(pagarmeID){
            var personCheckout = {
                    'DocumentNumber': customer.DocumentNumber,
                    'IdPagarme': pagarmeID
                };

            FoneclubeService.postUpdatePerson(personCheckout).then(function(result){
                console.log(result);
                initCardList(pagarmeID);
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
            });
        }

        function onTapNewCardPayment(){
            console.log('onTapNewCardPayment');
            ViewModelUtilsService.showModalNewCardPayment(customer);
        }


        function initCardList(customerId){


            PagarmeService.getCard(customerId)
            .then(function(result){
                vm.cards = result;
                console.log('-- cards --')
                console.log(result)
            })
            .catch(function(error){
                console.log(error);
                vm.message = 'falha ao recuperar cartão';
            });


        }

        function onTapCard(card){

            //vm.card = card;
            //etapaQuantia();
            console.log('onTapCard')
            ViewModelUtilsService.showModalExistentCardPayment(customer, card);

        }

         function onTapBoleto(card){
            console.log('onTapBoleto')
            ViewModelUtilsService.showModalBoleto(customer);

        }

        function onTapPagar(){

            vm.message = 'Transação iniciada';
            var customer;

            if(!vm.customer.address || !vm.customer.phone || !vm.customer.email || !vm.customer.document_number || !vm.customer.name)
            {
                customer = {
                    'name' : vm.customer.name,
                    'document_number' : vm.customer.document_number,
                    'email' : vm.customer.email
                    ,
                    'address' : {
                        'street' : 'empty',
                        'street_number' : '10',
                        'neighborhood' : 'empty',
                        'zipcode' : '01452000'
                    },
                    'phone' : {
                        'ddd' : '00',
                        'number' : '000000000'
                    }
                }
                //vm.message = 'Usuário incompleto';
            }

            console.log('on tap pagar');
            console.log(vm.card.id);
            console.log(vm.customer);
            console.log(vm.amount);
            console.log(customer);

             PagarmeService.postTransactionExistentCard(vm.amount, vm.card.id, customer)
             .then(function(result){
                console.log('nova transac ' + result);
                vm.message = 'Transação efetuada';
                PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){

                        vm.message = 'Transação concluída';
                    })
                    .catch(function(error){
                        try{
                            vm.message = 'Erro na captura da transação' + error.status;
                        }
                        catch(erro){
                            vm.message = 'Erro na captura da transação'
                        }
                        console.log(error);

                    });
             })


            console.log(customer)


        }

        function etapaEscolhaCartao(){
            vm.etapaEscolhaCartao = true;
            vm.etapaQuantia = false;
        }

        function etapaQuantia(){
            vm.etapaEscolhaCartao = false;
            vm.etapaQuantia = true;
        }

    }
})();