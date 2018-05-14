(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('BoletoModalController', BoletoModalController);
    
    // <<<<<<< HEAD
        BoletoModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService'];
        function BoletoModalController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService) {
    // =======
    //     BoletoModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'MainUtils', 'FoneclubeService', 'UtilsService'];
    //     function BoletoModalController(ViewModelUtilsService, PagarmeService, MainComponents, MainUtils, FoneclubeService, UtilsService) {
    // >>>>>>> release-branch
    
            var vm = this;
            vm.date = new Date();
            var customer = ViewModelUtilsService.modalBoletoData;
            vm.customer = customer;
            var newCustomer;
            vm.etapaDados = true;
            vm.chargeDisabled = true;
            vm.cobrancaRealizada = false;
          vm.amount = vm.customer.CacheIn ? vm.customer.CacheIn : '';
            vm.comment = '';
            console.log('BoletoModalController');
            vm.onTapPagar = onTapPagar;
            vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
            vm.onTapCancel = onTapCancel;
            vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;
            vm.checkOne = checkOne;
          vm.enviaEmail = true;
          vm.calculate = calculate;
            vm.years = [2018,2017,2016,2015,2014,2013,2012,2011,2010];
          vm.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

          vm.amount = 0;
          vm.amountTemp = 0;
          vm.amountTemp1 = 0;
          vm.bonus = 0;
            
            vm.year = new Date().getFullYear().toString();
            vm.month = (new Date().getMonth() + 1).toString();
    
            var existentCustomer = {
                        'name' : customer.Name,
                        'document_number' : customer.DocumentNumber,
                        'email' : customer.Email,
                        'address' : getAddress(customer),
                        'phone' : getContactPhone(customer)
    
            }

          vm.Padrão = false;
          vm.Excepcional = false;

          var CARTAO = 1;
          var BOLETO = 2;
          init();

          function init() {
            FoneclubeService.getHistoryPayment(customer.Id).then(function (result) {
              vm.histories = result;
              for (var i in vm.histories) {
                var history = vm.histories[i];
                history.descriptionType = (history.PaymentType == CARTAO) ? 'Cartão de crédito' : 'Boleto';
                if (i == 0) {
                  vm.commentBoleto
                  vm.comment = history.Comment;
                  vm.amount = history.Ammount / 100;

                  vm.amountTemp = vm.amount;
                  vm.amountTemp1 = vm.amount;
                }
                if (history.PaymentType == BOLETO) {
                  PagarmeService.getStatusBoleto(history.BoletoId).then(function (result) {
                    if (result.length > 0) {
                      history.StatusPayment = result[0].status;
                    }
                  })
                }
              }
              customer.histories = vm.histories;
            })
              .catch(function (error) {

              });
            

            FoneclubeService.getCommision(customer.Id).then(function (result) {
              vm.bonus = result.Ammount;
              calculate();
            })
              .catch(function (error) {

              });
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
            var amount = isNumber(vm.amountTemp) ? vm.amountTemp : parseFloat(vm.amountTemp) / 100;
            var bonus = isNumber(vm.bonus) ? vm.bonus : parseFloat(vm.bonus) / 100;
            vm.amountTemp1 = vm.pagar ? parseFloat(parseFloat(amount) - parseFloat(bonus)) : amount;
            vm.amountTemp1 = ((vm.amountTemp1 < 0 ? 0 : vm.amountTemp1).toFixed(2));
            vm.amount = vm.pagar ? vm.amountTemp1 : vm.amountTemp;
          }

          function onTapConfirmarPagamento() {
            debugger;
            //alert(vm.Excepcional);
            //if (!vm.claro) {
            //  vm.Excepcional
                if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                    return;
                }

                if (parseInt(vm.amount) < 100) {
                  DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Não é permitido cobranças a baixo de 1 Real' });
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
    
                console.log('tap pagar boleto')
                console.log(parseInt(vm.amount))
              var em = vm.amount.toString().split(".");
              console.log(em[0]);
              if (em[1] != undefined) {
                vm.amount = vm.amount.toString().replace(".", "")

              }
    
                vm.disableTapPay = true;
                vm.message = 'Iniciando transação';
                vm.instructions = 'FoneClub - 2017'
                debugger;
                // PagarmeService.postBoleto(vm.amount, vm.commentBoleto, existentCustomer)
                //  .then(function(result){
                //     console.log(result);

                if(!vm.expirationDateField)
                {
                    vm.expirationDateField = 5; 
                }
                else{
                   if(vm.expirationDateField <= 0)
                   {
                    vm.expirationDateField = 5; 
                   } 
                }

                     PagarmeService.postBoletoDirect(vm.amount, vm.commentBoleto, existentCustomer, addExpirationDays(vm.expirationDateField)).then(function(resultCapture){
    
                            debugger;
                            if(vm.enviaEmail)
                            {
                                debugger;
                                var emailObject = {
                                    'To': existentCustomer.email, //existentCustomer.email
                                    'TargetName' : existentCustomer.name,
                                    'TargetTextBlue': resultCapture.boleto_url,
                                    'TargetSecondaryText' : vm.commentBoleto,
                                    'TemplateType' : 2
                                }
        
                                FoneclubeService.postSendEmail(emailObject).then(function(result){
                                    console.log('FoneclubeService.postHistoryPayment');
                                    console.log(result);
                                })
                                .catch(function(error){
                                    console.log('catch error');
                                    console.log(error);
                                });
                            }
                            
    
                            try{
                              vm.TransactionId = resultCapture.tid;
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
                // }, function (error) {
                //     DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                //     vm.disableTapPay = false;
                // }).catch(function (error) {
                //     DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                //     vm.disableTapPay = false;
                // });
    
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
                        AcquireId: acquirer_id,
                        AnoVingencia:vm.year,
                        MesVingencia: vm.month,
                      ChargeStatus: vm.chargeStatus,
                      TransactionId: vm.TransactionId,
                      ComissionConceded: vm.pagar // need to see the property nameComissionConceded
                    }
                }
    
              FoneclubeService.postHistoryPayment(customerCharging).then(function (result) {

                
                FoneclubeService.dispatchedCommision(vm.customer.Id).then(function (result) {
                  //alert('success!!');
                })
                  .catch(function (error) {

                  })
                 
                })
                .catch(function(error){
                    console.log('catch error');
                    console.log(error);
                });
    
    
            }
    
    
            function getContactPhone(customer){
                var contacts = UtilsService.getContactPhoneFromPhones(customer.Phones);
                if (!contacts || contacts.length == 0  || contacts[0].DDD == '' || contacts[0].Number == '') {
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

            
            function addExpirationDays(days) {
                var dat = new Date();
                dat.setDate(dat.getDate() + days);
                return dat.toISOString();
              }
    
        }
    })();
