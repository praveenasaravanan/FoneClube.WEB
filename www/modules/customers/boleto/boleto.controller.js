(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('BoletoModalController', BoletoModalController);
    
  
        BoletoModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService', '$filter'];
        function BoletoModalController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService, $filter) {


            console.log('--- BoletoModalController ---');
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
            vm.onTapPagar = onTapPagar;
            vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
            vm.onTapCancel = onTapCancel;
            vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;
            vm.checkOne = checkOne;
            vm.enviaEmail = true;
            vm.enviaWhatsapp = true;
            vm.calculate = calculate;
            vm.years = [2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010];
            vm.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

            vm.amount = 0;
            vm.amountTemp = 0;
            vm.amountTemp1 = 0;
            vm.bonus = 0;
            vm.totaisComissoes = {};
            vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente = 0;
            vm.expirationDateField = 3;
            vm.year = new Date().getFullYear().toString();
            vm.month = (new Date().getMonth() + 1).toString();
            
            var customerId = customer.Id;
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
            calculate();

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

                  vm.amountTemp = vm.amount.toFixed(2);
                  vm.amountTemp1 = vm.amount.toFixed(2);
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

            FoneclubeService.getTotaisComissoes(customer.Id).then(function (result) {
              console.log('FoneclubeService.getTotaisComissoes')
              console.log(result)
              vm.totaisComissoes = result;

            })
            

            FoneclubeService.getCommision(customer.Id).then(function (result) {
              vm.bonus = parseFloat(result.Ammount / 100).toFixed(2);
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
            var amount = vm.amountTemp.toString().indexOf('.') > -1 ? parseFloat(vm.amountTemp) : parseFloat(vm.amountTemp) / 100;
            var bonus = vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente.toString().indexOf('.') > -1 ? parseFloat(vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente) : parseFloat(vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente) / 100;
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
            //alert(vm.Excepcional);
            //if (!vm.claro) {
            //  vm.Excepcional
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
                // debugger;
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
    
                        
                        try{
                            var chargingLog = {
                                'customer': existentCustomer,
                                'ammount': vm.amount,
                                'pagarmeResponse': resultCapture,
                                'boletoComment':vm.commentBoleto,
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

                        // debugger;
                            if(vm.enviaEmail)
                            {
                                // debugger;
                                if(vm.customerComment == undefined)
                                    vm.customerComment = ''

                                var emailObject = {
                                    'To': existentCustomer.email, //existentCustomer.email
                                    'TargetName' : existentCustomer.name,
                                    'TargetTextBlue': resultCapture.boleto_url,
                                    'TargetSecondaryText' : vm.customerComment,
                                    // 'CustomerComment':vm.customerComment,
                                    'TemplateType' : 2
                                }
                                
                                vm.boleto_url = resultCapture.boleto_url;

                                // debugger;

                                if(vm.pagar && vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente != '0.00')
                                {
                                    emailObject.DiscountPrice = ($filter('currency')(vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente / 100, "")).replace('.',',')
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

                            if(vm.enviaWhatsapp){
                                debugger;
                              //Send message to whatsapp
                              if(vm.customerComment == undefined)
                                    vm.customerComment = ''

                                var messageObject = {
                                    'ClientId': vm.customer.Id, //existentCustomer.email
                                    'ClientName' : vm.customer.Name,
                                    'CurrentYear': vm.year,
                                    'CurrentMonth' : vm.month,
                                    'CurrentDate' : vm.expirationDateField,
                                    'AmountTemp':vm.amountTemp,
                                    'ValorTotalLiberadoParaPagarCliente':vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente,
                                    'AmountTemp1':vm.amountTemp1,
                                    'CustomerComment':vm.customerComment,
                                    'CommentBoleto':vm.commentBoleto,
                                    'Comment':vm.comment
                                }
                                FoneclubeService.postSendChargeMessage(messageObject).then(function(result){
                                    console.log('Whatsapp Message sent');
                                    console.log(result);
                                })
                                .catch(function(error){
                                    console.log('Whats app message could not sent. See error log bellow:');
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
                        CommentEmail:vm.customerComment,
                        CommentBoleto:vm.commentBoleto,
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

                    if(vm.pagar)
                    {
                        FoneclubeService.dispatchedCommision(vm.customer.Id).then(function (result) {

                          if(!result)
                            alert('Não foi possível dar baixa em comissão');
                            

                            // FoneclubeService.dispatchedBonus(vm.customer.Id).then(function (result) {
                              
                            //   debugger
                            //   if(!result)
                            //     alert('Não foi possível dar baixa em comissão');

                            // })
                            // .catch(function (error) {
                            //   alert('Não foi possível dar baixa em comissão');
                            // })

                        })
                        .catch(function (error) {
                          alert('Não foi possível dar baixa em comissão');
                        })
                    }
                   
                     
                    })
                    .catch(function(error){
                        // debugger
                        alert('Aviso em verificação secundária, printar tela -  ' 
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
                        + '  bc372'
                        )
                        console.log('catch error');
                        console.log(error);
                    });
        
        
                }
                function getContactPhone(customer){

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
                if (!contacts || contacts.length == 0  || contacts[0].DDD == '' || contacts[0].Number == '') {
                    // debugger
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
