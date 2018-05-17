(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('ExistentCardPaymentModalController', ExistentCardPaymentModalController);

    ExistentCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'FoneclubeService', 'MainUtils', 'UtilsService', '$scope', 'DialogFactory', '$filter'];
    function ExistentCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainComponents, FoneclubeService, MainUtils, UtilsService, $scope, DialogFactory, $filter) {

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
        vm.chargeDisabled = true;
        vm.checkOne = checkOne;
        console.log('ExistentCardPaymentModalController');
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
        vm.onTapCancel = onTapCancel;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;

        vm.years = [2018,2017,2016,2015,2014,2013,2012,2011,2010];
        vm.months = [1,2,3,4,5,6,7,8,9,10,11,12];
        
        vm.year = new Date().getFullYear().toString();
        vm.month = (new Date().getMonth() + 1).toString();
        vm.calculate = calculate;

        vm.amount = 0;
        vm.amountTemp = 0;
        vm.amountTemp1 = 0;
        vm.bonus = 0;

        if (vm.customer.CacheIn) {
          vm.amount = vm.customer.CacheIn;
          vm.amountTemp = vm.amount.toFixed(2);
          vm.amountTemp1 = vm.amount.toFixed(2);
        }
        
        var existentCustomer = {
            'name' : customer.Name,
            'document_number' : customer.DocumentNumber,
            'email' : customer.Email,
            'address' : getAddress(customer),
            'phone' : getContactPhone(customer)
        }

        init();
        function init() {
          FoneclubeService.getCommision(customer.Id).then(function (result) {
            vm.bonus = parseFloat(result.Ammount / 100).toFixed(2);
            calculate();
          })
            .catch(function (error) {

            });
        }

        vm.Padrão = false;
        vm.Excepcional = false;
        vm.existentCustomer = existentCustomer;


        function checkOne(val) {
          //alert('xx');
          vm.chargeDisabled = false;
          if (val == '1') {
            vm.chargeStatusfirst = true;
            vm.chargeStatusSecond = false;
            vm.chargeStatus = 1;
          }
          if (val == '2') {
            vm.chargeStatusSecond = true;
            vm.chargeStatusfirst = false;
            vm.chargeStatus = 2;
          }
        }

        function calculate() {
          var amount = vm.amountTemp.toString().indexOf('.') > -1 ? parseFloat(vm.amountTemp) : parseFloat(vm.amountTemp) / 100;
          var bonus = vm.bonus.toString().indexOf('.') > -1 ? parseFloat(vm.bonus) : parseFloat(vm.bonus) / 100;
          vm.amountTemp1 = vm.pagar ? parseFloat(amount - bonus) : amount;
          if (vm.pagar) {
            vm.amount = parseFloat(vm.amountTemp1).toFixed(2);
          }
          else {
            vm.amount = parseFloat(amount).toFixed(2);
          }

          if (isNaN(vm.amount)) {
            vm.amount = 0;
          }

          vm.amountTemp1 = vm.amount;
        }

        function onTapConfirmarPagamento() {
            if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                return;
            }

            if (parseInt(vm.amount) < 1) {
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Não é possível criar uma cobrança com valor inferior a R$1.00. Por favor corrija o valor ou opte por criar uma ordem de serviço com os detalhes desta cobrança.' });
              return;
            }
            if (!vm.chargeStatus) {
              vm.chargeStatusDiv = true;
              vm.etapaDados = false;
              vm.etapaConfirmacao = false;
            }
            else {
              vm.etapaDados = false;
              vm.etapaConfirmacao = true;
              vm.chargeStatusDiv = false;
            }
        }
        
        function onTapCancel(number){
            vm.etapaDados = true;
            vm.etapaConfirmacao = false;
            vm.chargeStatusDiv = false;
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
            var em = vm.amount.toString().split(".");
            if (em[1] != undefined) {
              vm.amount = vm.amount.toString().replace(".", "")

            }

            vm.disableTapPay = true;
            vm.message = 'Iniciando transação';
            PagarmeService.postTransactionExistentCard(vm.amount, card.id, existentCustomer).then(function(result){
                vm.message = 'Transação efetuada';
                debugger;
                PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){
                        vm.message = 'Transação concluída';
                        vm.TransactionId = result.tid;
                        var emailObject = {
                            'To': vm.existentCustomer.email, //vm.existentCustomer
                            'TargetName' : vm.existentCustomer.name,
                            'TargetTextBlue' : $filter('currency')(vm.amount / 100, ""),
                            // 'TargetSecondaryText' : vm.commentBoleto,
                            'TemplateType' : 1
                        }

                        FoneclubeService.postSendEmail(emailObject).then(function(result){
                            console.log('FoneclubeService.postHistoryPayment');
                            console.log(result);
                        })
                        .catch(function(error){
                            console.log('catch error');
                            console.log(error);
                        });

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
           
            var customerCharging = {
                Id: vm.customer.Id,
                Charging:{
                    Comment:vm.comment,
                    Ammount: vm.amount,
                    CollectorName: MainUtils.getAgent(),
                    PaymentType: CARTAO,
                    AnoVingencia:vm.year,
                    MesVingencia: vm.month,
                    ChargeStatus: vm.chargeStatus,
                    TransactionId: vm.TransactionId
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
