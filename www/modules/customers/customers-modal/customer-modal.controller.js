(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('CustomerModalController', CustomerModalController);

  CustomerModalController.inject = [
    'ViewModelUtilsService',
    'PagarmeService',
    'FoneclubeService',
    'FlowManagerService',
    'DialogFactory'
  ];

  function CustomerModalController(
    ViewModelUtilsService,
    PagarmeService,
    FoneclubeService,
    FlowManagerService,
    DialogFactory
  ) {

    var vm = this;

    var customer = ViewModelUtilsService.modalCustomerData;

    var CARTAO = 1;
    var BOLETO = 2;
    vm.so_cnt = 0;
    vm.co_cnt = 0;

    var carregandoPagarme = false;
    vm.showCards = true;
    vm.showChargings = true;
    vm.showServiceOrders = true;
    vm.showSecundaryChargings = false;
    vm.showFlags = false;
    vm.flags = [];

    vm.month = new Date().getMonth() + 1;
    vm.year = new Date().getFullYear();
    vm.mensagemPagarme = 'Refresh DB';

    vm.onTapNewCardPayment = onTapNewCardPayment;
    vm.onTapBoleto = onTapBoleto;
    vm.onTapCard = onTapCard;
    vm.onTapEditar = onTapEditar;
    vm.onTapExcluir = onTapExcluir;
    vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;
    vm.onTapOrdemServico = onTapOrdemServico;
    vm.cancelarPagamento = etapaEscolhaCartao;
    vm.onTapComment = onTapComment;
    vm.onTapFlag = onTapFlag;
    vm.customer = customer;

    vm.onTapUpdatePagarme = onTapUpdatePagarme;
    vm.onResentEmail = onResentEmail;
    vm.onClickCardTitle = onClickCardTitle;
    vm.onClickChargingsTitle = onClickChargingsTitle;
    vm.onClickServiceOrdersTitle = onClickServiceOrdersTitle;
    vm.onClickSecundaryChargingsTitle = onClickSecundaryChargingsTitle;
    vm.onClickFlagsTitle = onClickFlagsTitle;
    vm.editPendingFlag = editPendingFlag;
    vm.formatDate = formatDate;
    vm.onTapDebito = onTapDebito;

    init();

    function init() {
      // debugger
      if (!customer.IdPagarme) {
        PagarmeService.getCustomer(customer.DocumentNumber)
          .then(function (result) {
            try {
              var pagarmeID = result[0].id;
              updatePagarmeId(pagarmeID);
              initCardList(pagarmeID);
              etapaEscolhaCartao();
            } catch (erro) {
              console.log(erro);
              etapaEscolhaCartao();
            }
          })
          .catch(function (error) {
            console.log(error);
            etapaEscolhaCartao();
          });
      } else {
        etapaEscolhaCartao();
        initCardList(customer.IdPagarme);
      }

      FoneclubeService.getPersonFlags(customer.Id).then(
        function (result) {
          var lista = result;
          lista.reverse();
          vm.flags = lista
        }
      );



      FoneclubeService.getStatusChargingOfCustomer(customer.Id, vm.month, vm.year).then(
        function (result) {
          vm.charged_status = result[0];
        }
      );

      FoneclubeService.getChargeAndServiceOrderHistory(customer.Id).then(function (result){
        
        debugger;
        vm.chargesAndOrders = result;
        vm.chargesArray = [];
        vm.osArray = [];
        vm.osDescArray = [];
        // debugger;

        for (var i in vm.chargesAndOrders) {
          // if (parseInt(i) >= 203) {
          //   // debugger
          // }

          var data = vm.chargesAndOrders[+i];

          if (data.IsCharge) {
            try {
              vm.chargesAndOrders[i].Charges.resentMessage = 'Reenviar email';
            } catch (e) { }

            
            data.Charges.descriptionType = data.Charges.PaymentType == CARTAO ? 'Cartão de crédito' : 'Boleto';

            var DEBITO = 3;
            if(data.Charges.PaymentType == DEBITO)
               data.Charges.descriptionType = "Débito";

            if (data.Charges) {
              if (data.Charges.BoletoExpires) {
                var expiryDate = new Date(data.Charges.ExpireDate);
                var expiryDateAfter4 = new Date(data.Charges.ExpireDate);
                expiryDateAfter4.setDate(expiryDateAfter4.getDate() + 3);

                var currentDate = new Date();
                if (data.Charges.PaymentStatusDescription == "Paid") {
                  data.Charges.statusColor = "Green";
                }
                else if (data.Charges.descriptionType == "Boleto" && data.Charges.PaymentStatusDescription == "WaitingPayment" && currentDate <= expiryDate) {
                  //  change status to "Aguardando Pagamento" = Green Icon
                  data.Charges.statusColor = "Green";
                }
                else if (data.Charges.descriptionType == "Boleto" && data.Charges.PaymentStatusDescription == "WaitingPayment" && currentDate < expiryDateAfter4) {
                  //change status to "Pendente Pagamento"   Yello Icon
                  data.Charges.statusColor = "Yellow";
                }
                else if (data.Charges.descriptionType == "Boleto" && data.Charges.PaymentStatusDescription == "WaitingPayment" && currentDate > expiryDateAfter4) {
                  // change status to "Pendente Pagamento"   RED Icon
                  data.Charges.statusColor = "Red";
                }
                else {
                  data.Charges.statusColor = "grey";
                }
              }
              else {
                if (data.Charges.PaymentStatusDescription == "Paid") {
                  data.Charges.statusColor = "Green";
                }
                else {
                  data.Charges.statusColor = "grey";
                }
              }
            }

            if (data.Charges.PaymentType == CARTAO && data.Charges.PaymentStatusDescription == 'Paid') {
              data.Charges.PaymentStatusDescription = 'Accepted';
            }
            vm.chargesArray.push(data); // na moral ning merece
          }
          if (data.IsServiceOrder) {
            // debugger
            vm.osArray.push(data);
          }
        }
        // debugger
        for (var i in vm.osArray) {
          vm.osDescArray.push(vm.osArray[vm.osArray.length - i]);
        }

        customer.chargesAndOrders = vm.chargesAndOrders;
      });

      FoneclubeService.getHistoryPayment(customer.Id)
        .then(function (result) {
          vm.histories = result;
          for (var i in vm.histories) {
            var history = vm.histories[i];
            history.descriptionType =
              history.PaymentType == CARTAO ? 'Cartão de crédito' : 'Boleto';

            if (history.PaymentType == BOLETO) {
            }
          }
          customer.histories = vm.histories;
        })
        .catch(function (error) {
          console.log('catch error');
          console.log(error);
        });

      FoneclubeService.getTblServiceOrders(customer.Id)
        .then(function (result) {
          console.log('FoneclubeService.getTblServiceOrders');
          console.log(result);
          vm.orders = result;
        })
        .catch(function (error) {
          console.log('catch error');
          console.log(error);
        });

      FoneclubeService.getChargingLog(customer.Id)
        .then(function (result) {
          console.log('getChargingLog');
          // debugger;
          vm.historyLog = [];
          for (var i in result) {
            vm.historyLog.push(JSON.parse(result[i]));
          }
          // debugger;
        })
        .catch(function (error) {
          console.log('catch error');
          console.log(error);
        });
    }

    function formatDate(date) {
      date = date.split(' ')[0];
      var dateOut = new Date(date);
      dateOut = dateOut.getDate() + "/" + getMonth(dateOut.getMonth()) + "/" + dateOut.getFullYear().toString().substring(2);
      return dateOut;
    }

    function getMonth(monthNumber) {
      var months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      return months[monthNumber];
    }

    function onTapUpdatePagarme() {
      if (!carregandoPagarme) {
        carregandoPagarme = true;
        vm.mensagemPagarme = 'Aguarde...';
        FoneclubeService.getUpdatePagarme().then(function (result) {
          if (result)
            alert('Lista pagarme atualizada, por favor recarregue a página sem cache.');
          else alert('Lista pagarme não atualizada');

          carregandoPagarme = false;
          vm.mensagemPagarme = 'Refresh DB';
        });
      }
    }

    function onTapExcluir() {
      var personCheckout = {
        DocumentNumber: customer.DocumentNumber
      };
      DialogFactory.dialogConfirm({
        mensagem:
          'Atenção essa ação irá excluir o cliente da base foneclube, após exclusão não terá volta, deseja proseguir?'
      }).then(function (value) {
        if (value) {
          FoneclubeService.postDeletePerson(personCheckout)
            .then(function (result) {
              console.log(result);
              if (result) {
                DialogFactory.showMessageDialog({
                  message:
                    'Usuário foi removido com sucesso, no próximo carregamento da lista ele não será mais exibido'
                });
                closeThisDialog(0);
              } else DialogFactory.showMessageDialog({ message: 'Usuário não foi removido, guarde o documento dele: ' + customer.DocumentNumber });
            })
            .catch(function (error) {
              console.log('catch error');
              console.log(error);
            });
        }
      });
    }

    function setStatusBoleto(history) {
      console.log('setStatusBoleto');
      console.log(history);
      PagarmeService.getStatusBoleto(history.BoletoId).then(function (result) {
        history.StatusPayment = result[0].status;
        boleto_url;
      });
    }

    function updatePagarmeId(pagarmeID) {
      var personCheckout = {
        DocumentNumber: customer.DocumentNumber,
        IdPagarme: pagarmeID
      };

      FoneclubeService.postUpdatePerson(personCheckout)
        .then(function (result) {
          console.log(result);
          initCardList(pagarmeID);
        })
        .catch(function (error) {
          console.log('catch error');
          console.log(error);
        });
    }

    function onTapNewCardPayment() {
      console.log('onTapNewCardPayment');
      ViewModelUtilsService.showModalNewCardPayment(customer);
    }

    function onTapComment() {
      ViewModelUtilsService.showModalComment(customer);
    }

    function onTapFlag() {
      ViewModelUtilsService.showModalFlag(customer);
    }

    function initCardList(customerId) {
      PagarmeService.getCard(customerId)
        .then(function (result) {
          vm.cards = result.sort(function (a, b) {
            return new Date(b.date_updated) > new Date(a.date_updated) ? 1 : -1;
          });
        })
        .catch(function (error) {
          console.log(error);
          vm.message = 'falha ao recuperar cartão';
        });
    }

    function onTapCard(card) {
      ViewModelUtilsService.showModalExistentCardPayment(customer, card);
    }

    function onTapBoleto(card) {
      ViewModelUtilsService.showModalBoleto(customer);
    }

    function onTapPagar() {
      vm.message = 'Transação iniciada';
      var customer;

      if (
        !vm.customer.address ||
        !vm.customer.phone ||
        !vm.customer.email ||
        !vm.customer.document_number ||
        !vm.customer.name
      ) {
        customer = {
          name: vm.customer.name,
          document_number: vm.customer.document_number,
          email: vm.customer.email,
          address: {
            street: 'empty',
            street_number: '10',
            neighborhood: 'empty',
            zipcode: '01452000'
          },
          phone: {
            ddd: '00',
            number: '000000000'
          }
        };
      }

      PagarmeService.postTransactionExistentCard(vm.amount, vm.card.id, customer).then(
        function (result) {
          vm.message = 'Transação efetuada';
          PagarmeService.postCaptureTransaction(result.token, vm.amount)
            .then(function (result) {
              vm.message = 'Transação concluída';
            })
            .catch(function (error) {
              try {
                vm.message = 'Erro na captura da transação' + error.status;
              } catch (erro) {
                vm.message = 'Erro na captura da transação';
              }
              console.log(error);
            });
        }
      );
    }

    function etapaEscolhaCartao() {
      vm.amount = '';
      vm.etapaEscolhaCartao = true;
      vm.etapaQuantia = false;
    }

    function etapaQuantia() {
      vm.etapaEscolhaCartao = false;
      vm.etapaQuantia = true;
    }

    function onTapEditar() {
      FlowManagerService.changeEdicaoView(customer);
    }

    function onTapPaymentHistoryDetail(history) {
      ViewModelUtilsService.showModalPaymentHistoryDetail(history, vm.customer);
    }

    function onTapOrdemServico() {
      FlowManagerService.changeOrdemServicoView(customer);
    }

    function onResentEmail(charge) {
      debugger;
      var DEBITO = 3;
      if(charge.PaymentType == DEBITO)
      {
       alert('ainda não é possível reenviar email de cobrança de débito');
       return; 
      }

      DialogFactory.dialogConfirm({
        mensagem: 'Tem certeza que deseja reenviar o email dessa cobrança?'
      }).then(function (value) {
        if (value) {
          if (charge.resentMessage != 'Enviando...') {
            charge.resentMessage = 'Enviando...';
            console.log(vm.customer);
            if (charge.PaymentType == BOLETO) {
              var boletoUrl = '';
              if (charge.boleto_url) boletoUrl = charge.boleto_url;

              var emailObject = {
                To: vm.customer.Email,
                TargetName: vm.customer.Name,
                TargetTextBlue: boletoUrl,
                TargetSecondaryText: charge.CommentEmail,
                TemplateType: BOLETO,
                DiscountPrice: (charge.Ammount / 100).toFixed(2).replace('.', ',')
              };

              // emailObject.DiscountPrice = ($filter('currency')(vm.bonus / 100, "")).replace('.',',');

              FoneclubeService.postSendEmail(emailObject)
                .then(function (result) {
                  console.log(result);
                  charge.resentMessage = 'Reenviar email';
                  DialogFactory.showMessageDialog({
                    mensagem: 'Email reenviado com sucesso',
                    titulo: 'Informação'
                  });
                })
                .catch(function (error) {
                  console.log('catch error');
                  console.log(error);
                  charge.resentMessage = 'Reenviar email';
                  DialogFactory.showMessageDialog({
                    mensagem: 'Email não reenviado ' + error.message,
                    titulo: 'Informação'
                  });
                });
            }

            if (charge.PaymentType == CARTAO) {
              var emailObject = {
                To: vm.customer.Email,
                TargetName: vm.customer.Name,
                TargetTextBlue: (charge.Ammount / 100).toFixed(2).replace('.', ','),
                TargetSecondaryText: charge.CommentEmail,
                TemplateType: CARTAO
              };

              FoneclubeService.postSendEmail(emailObject)
                .then(function (result) {
                  console.log(result);
                  charge.resentMessage = 'Reenviar email';
                  DialogFactory.showMessageDialog({
                    mensagem: 'Email reenviado com sucesso',
                    titulo: 'Informação'
                  });
                })
                .catch(function (error) {
                  console.log('catch error');
                  console.log(error);
                  charge.resentMessage = 'Reenviar email';
                  DialogFactory.showMessageDialog({
                    mensagem: 'Email não reenviado ' + error.message,
                    titulo: 'Informação'
                  });
                });
            }
          }
        }
      });
    }

    function onClickCardTitle() {
      console.log('teste')
      vm.showCards = !vm.showCards;
    }

    function onClickChargingsTitle() {
      vm.showChargings = !vm.showChargings;
    }

    function onClickServiceOrdersTitle() {
      vm.showServiceOrders = !vm.showServiceOrders;
    }

    function onClickSecundaryChargingsTitle() {
      vm.showSecundaryChargings = !vm.showSecundaryChargings;
    }

    function onClickFlagsTitle() {
      vm.showFlags = !vm.showFlags;
      console.log(vm.showFlags)
    }

    function onTapDebito(customer) {
      ViewModelUtilsService.showModalDebito(customer);
    }

    function editPendingFlag(flag) {
      // alert('Edição ainda não implementada')
      debugger;
      var tempFlag = {
        'Id': flag.Id,
        'PendingInteraction': !flag.PendingInteraction
      }

      FoneclubeService.postUpdateFlag(tempFlag).then(function (result) {
        debugger
        console.log(result);
        if (result) {
          flag.PendingInteraction = !flag.PendingInteraction
          DialogFactory.showAlertDialog({ message: 'Flag alterada com sucesso' });
        } else {
          DialogFactory.showAlertDialog({ message: 'Update de flag falhou' });
        }
      });
    }

    //clientes com flag em aberto aparece icone de bandeira preenchida, os que não tiverem, bandeira vazia
    // ao clicar na bandeira cheia abre modal com flags expandidas, caso contrário abrem colapsado
  }
})();
