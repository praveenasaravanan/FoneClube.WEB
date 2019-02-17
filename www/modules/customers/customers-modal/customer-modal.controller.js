(function() {
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
    var carregandoPagarme = false;

    // whatsapp
    // var mensagem = "&text=Prezado%20cliente%2C%20estamos%20enviando%20o%20seu%20boleto%20tamb%C3%A9m%20por%20whatsapp.%20Um%20abra%C3%A7o%20da%20Equipe%20Foneclube%20{0}"
    // replace('/', '%2F')

    vm.so_cnt = 0;
    vm.co_cnt = 0;
    vm.month = new Date().getMonth() + 1;
    vm.year = new Date().getFullYear();
    vm.onTapNewCardPayment = onTapNewCardPayment;
    vm.onTapBoleto = onTapBoleto;
    vm.onTapCard = onTapCard;
    vm.onTapEditar = onTapEditar;
    vm.onTapExcluir = onTapExcluir;
    vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;
    vm.onTapOrdemServico = onTapOrdemServico;
    vm.cancelarPagamento = etapaEscolhaCartao;
    vm.onTapComment = onTapComment;
    vm.customer = customer;
    vm.mensagemPagarme = 'Refresh DB';
    vm.onTapUpdatePagarme = onTapUpdatePagarme;
    vm.onResentEmail = onResentEmail;

    init();

    function init() {
      if (!customer.IdPagarme) {
        PagarmeService.getCustomer(customer.DocumentNumber)
          .then(function(result) {
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
          .catch(function(error) {
            console.log(error);
            etapaEscolhaCartao();
          });
      } else {
        etapaEscolhaCartao();
        initCardList(customer.IdPagarme);
      }
      FoneclubeService.getStatusChargingOfCustomer(customer.Id, vm.month, vm.year).then(
        function(result) {
          vm.charged_status = result[0];
        }
      );

      FoneclubeService.getChargeAndServiceOrderHistory(customer.Id).then(function(
        result
      ) {
        vm.chargesAndOrders = result;

        vm.chargesArray = [];
        vm.osArray = [];
        vm.osDescArray = [];
        // debugger;

        for (var i in vm.chargesAndOrders) {
          if (parseInt(i) >= 203) {
            // debugger
          }

          var data = vm.chargesAndOrders[+i];

          if (data.IsCharge) {
            try {
              vm.chargesAndOrders[i].Charges.resentMessage = 'Reenviar email';
            } catch (e) {}

            data.Charges.descriptionType =
              data.Charges.PaymentType == CARTAO ? 'Cartão de crédito' : 'Boleto';

            if (data.Charges.PaymentType == BOLETO) {
              PagarmeService.getBoletoUrl(data.Charges.BoletoId, vm.chargesAndOrders, i)
                .then(function(result) {
                  try {
                    result.chargesAndOrders[result.index].Charges.boleto_url =
                      result[0].boleto_url;
                    data.Charges.boleto_url = result[0].boleto_url;
                  } catch (erro) {}
                })
                .catch(function(error) {
                  console.log(error);
                });
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
        .then(function(result) {
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
        .catch(function(error) {
          console.log('catch error');
          console.log(error);
        });

      FoneclubeService.getTblServiceOrders(customer.Id)
        .then(function(result) {
          console.log('FoneclubeService.getTblServiceOrders');
          console.log(result);
          vm.orders = result;
        })
        .catch(function(error) {
          console.log('catch error');
          console.log(error);
        });

      FoneclubeService.getChargingLog(customer.Id)
        .then(function(result) {
          console.log('getChargingLog');
          // debugger;
          vm.historyLog = [];
          for (var i in result) {
            vm.historyLog.push(JSON.parse(result[i]));
          }
          // debugger;
        })
        .catch(function(error) {
          console.log('catch error');
          console.log(error);
        });
    }

    function onTapUpdatePagarme() {
      if (!carregandoPagarme) {
        carregandoPagarme = true;
        vm.mensagemPagarme = 'Aguarde...';
        FoneclubeService.getUpdatePagarme().then(function(result) {
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
      }).then(function(value) {
        if (value) {
          FoneclubeService.postDeletePerson(personCheckout)
            .then(function(result) {
              console.log(result);
              if (result) {
                DialogFactory.showMessageDialog({
                  message:
                    'Usuário foi removido com sucesso, no próximo carregamento da lista ele não será mais exibido'
                });
                closeThisDialog(0);
              } else DialogFactory.showMessageDialog({ message: 'Usuário não foi removido, guarde o documento dele: ' + customer.DocumentNumber });
            })
            .catch(function(error) {
              console.log('catch error');
              console.log(error);
            });
        }
      });
    }

    function setStatusBoleto(history) {
      console.log('setStatusBoleto');
      console.log(history);
      PagarmeService.getStatusBoleto(history.BoletoId).then(function(result) {
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
        .then(function(result) {
          console.log(result);
          initCardList(pagarmeID);
        })
        .catch(function(error) {
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

    function initCardList(customerId) {
      PagarmeService.getCard(customerId)
        .then(function(result) {
          vm.cards = result.sort(function(a, b) {
            return new Date(b.date_updated) > new Date(a.date_updated) ? 1 : -1;
          });
        })
        .catch(function(error) {
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
        function(result) {
          vm.message = 'Transação efetuada';
          PagarmeService.postCaptureTransaction(result.token, vm.amount)
            .then(function(result) {
              vm.message = 'Transação concluída';
            })
            .catch(function(error) {
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
      // debugger;

      DialogFactory.dialogConfirm({
        mensagem: 'Tem certeza que deseja reenviar o email dessa cobrança?'
      }).then(function(value) {
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
                .then(function(result) {
                  console.log(result);
                  charge.resentMessage = 'Reenviar email';
                  DialogFactory.showMessageDialog({
                    mensagem: 'Email reenviado com sucesso',
                    titulo: 'Informação'
                  });
                })
                .catch(function(error) {
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
                .then(function(result) {
                  console.log(result);
                  charge.resentMessage = 'Reenviar email';
                  DialogFactory.showMessageDialog({
                    mensagem: 'Email reenviado com sucesso',
                    titulo: 'Informação'
                  });
                })
                .catch(function(error) {
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
  }
})();
