(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('ExistentCardPaymentModalController', ExistentCardPaymentModalController);

    ExistentCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'FoneclubeService', 'MainUtils', 'UtilsService', '$scope', 'DialogFactory', '$filter'];
    function ExistentCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainComponents, FoneclubeService, MainUtils, UtilsService, $scope, DialogFactory, $filter) {

        console.log('ExistentCardPaymentModalController');
        var vm = this;
        var newCustomer;
        var cardData;
        var CARTAO = 1;
        var customer = ViewModelUtilsService.modalExistentCardPaymentData;
        var card = ViewModelUtilsService.modalExistentCardData;

        vm.etapaDados = true;
        vm.customer = customer;
        vm.card = card;
        vm.amount = '';
        vm.comment = '';
        vm.cobrancaRealizada = false;
        vm.chargeDisabled = true;
        vm.checkOne = checkOne;
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;

        vm.onDate = onDate;
        vm.onTime = onTime;
        vm.date_selected = false;
        vm.time_selected = false;

        vm.date = "";
        vm.time = "";

        vm.onTapAddComment = onTapAddComment;
        vm.onTapCancel = onTapCancel;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;

        vm.years = [2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010];
        vm.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        vm.year = new Date().getFullYear().toString();
        vm.month = (new Date().getMonth() + 1).toString();
        
        vm.date_time = new Date().getFullYear().toString();
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
        
        // debugger;
        var customerId = customer.Id;
        var existentCustomer = {
            'name' : customer.Name,
            'document_number' : customer.DocumentNumber,
            'email' : customer.Email,
            'address' : getAddress(customer),
            'phone' : getContactPhone(customer)
        }

        init();

        function init() {
        FoneclubeService.getTotaisComissoes(customer.Id).then(function (result) {
            console.log('FoneclubeService.getTotaisComissoes')
            console.log(result)
            debugger
            vm.bonus = parseFloat(result.ValorTotalLiberadoParaPagarCliente/ 100).toFixed(2);

          })

            
            FoneclubeService.getLastPersonCharging(customer.Id).then(function (result) {
                // debugger
                vm.comment = result.txtComment;
            })
        }

        vm.Padrão = false;
        vm.Excepcional = false;
        vm.existentCustomer = existentCustomer;

        // listener when clicking Schedule button
        function onTapAddComment(data){
            // debugger;
            data.intIdPerson=customer.Id;
            data.txtDescription = "Cartao nao passou R$" + data.amount +" on " + vm.date.toString();
            // data.dteRegister = ""
            data.bitPendingInteraction = true;

            // alert(data.txtDescription)

            FoneclubeService.postCustomerComment(data).then(function(result){
                // debugger;
                console.log(result);
                if(result){
                    DialogFactory.showAlertDialog({message: 'Inserido com sucesso'});
                }
                else
                    DialogFactory.showAlertDialog({message: 'Inserido falhou'});
            })
                .catch(function(error){
                    console.log('catch error');
                    console.log(error);
                });

        }
        // listener when selecting date for scheduling
        function onDate(date) {
            // debugger
            if(date){
                vm.date_selected = true;
                vm.date = date;
            }
        }

        // listener when selecting time for scheduling
        function onTime(time) {
            // debugger
            if(time){
                vm.time_selected = true;
                vm.time = time;
                // alert(vm.time)
            }
        }
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
            // debugger
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
            // debugger;
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
            // debugger;
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
            // debugger;
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
                // debugger;
                PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){
                        
                        vm.message = 'Transação concluída';
                        vm.TransactionId = result.tid;

                        if(vm.customerComment == undefined)
                            vm.customerComment = ''

                        var emailObject = {
                            'To': vm.existentCustomer.email, //vm.existentCustomer
                            'TargetName' : vm.existentCustomer.name,
                            'TargetTextBlue' : $filter('currency')(vm.amount / 100, ""),
                            // 'CustomerComment':vm.customerComment,
                            'TargetSecondaryText' : vm.customerComment,
                            'TemplateType' : 1
                        }

                        
                        if(vm.pagar && vm.bonus != '0.00')
                        {
                            emailObject.DiscountPrice = ($filter('currency')(vm.bonus / 100, "")).replace('.',',')
                        }

                        try{
                            var chargingLog = {
                                'customer': existentCustomer,
                                'ammount': vm.amount,
                                'pagarmeResponse': result,
                                'customerComment':vm.customerComment,
                                'foneclubeComment' : vm.comment
                            };

                            // debugger
                            FoneclubeService.postChargingLog(JSON.stringify(chargingLog), customerId).then(function(result){
                                console.log(result);
                            })
                            .catch(function(error){
                                console.log('catch error');
                                console.log(error);
                                var teste1 = emailObject;
                                var teste2 = existentCustomer;
                                var teste3 = vm.amount;
                                alert("Alerta a cobrança não pode ser salva, se possível pare a tela aqui sem atualizar nada e entre em contato com cardozo")
                            });
                        }
                        catch(erro){
                            var teste1 = emailObject;
                            var teste2 = existentCustomer;
                            var teste3 = vm.amount;
                            alert("Alerta a cobrança não pode ser salva, se possível pare a tela aqui sem atualizar nada e entre em contato com cardozo")
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
            
            var customerCharging = {
                Id: vm.customer.Id,
                Charging:{
                    Comment:vm.comment,
                    CommentEmail:vm.customerComment,
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
                
                if(vm.pagar)
                {   FoneclubeService.dispatchedCommision(vm.customer.Id).then(function (result) {
                    //alert('success!!');
                  })
                    .catch(function (error) {

                    })
                }

            })
            .catch(function(error){
                alert('Aviso em verificação secundária, printar tela - ' 
                        + '_' + customerCharging.Id
                        + '_' + customerCharging.ChargeStatus
                        + '_' + customerCharging.TransactionId
                        + '_' + customerCharging.ComissionConceded
                        + '_' + customerCharging.Charging.Comment
                        + '_' + customerCharging.Charging.CommentEmail
                        + '_' + customerCharging.Charging.CommentBoleto
                        + '_' + customerCharging.Charging.Ammount
                        + '_' + customerCharging.Charging.CollectorName
                        + '_' + customerCharging.Charging.PaymentType
                        + '_' + customerCharging.Charging.BoletoId
                        + '_' + customerCharging.Charging.AcquireId
                        + '_' + customerCharging.Charging.AnoVingencia
                        + '_' + customerCharging.Charging.MesVingencia
                        + ' ecc333'
                        )
                console.log('catch error');
                console.log(error);
            });

        }

        function getContactPhone(customer){
            // debugger;
            try{
                return {
                    'ddd' : customer.Phones[0].DDD.toString(),
                    'number' : customer.Phones[0].Number.toString()
                }
            }
            catch(e){
                return {
                    'ddd' : '21',
                    'number' : '997865645'
                }
            }
            
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
            // debugger;
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
