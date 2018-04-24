(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('EdicaoController', EdicaoController)
    .directive('ngPrism', function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.ready(function () {
            Prism.highlightElement(element[0]);
          });
        }
      };
    });


  EdicaoController.inject = ['$scope', 'DataFactory', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', '$stateParams', 'FlowManagerService', '$timeout', 'HubDevService', '$q', '$ionicScrollDelegate', 'UtilsService', 'DialogFactory', 'ngDialog', '$http', '$sce', '$rootScope'];
  function EdicaoController($scope, DataFactory, ViewModelUtilsService, FoneclubeService, MainUtils, $stateParams, FlowManagerService, $timeout, HubDevService, $q, $ionicScrollDelegate, UtilsService, DialogFactory, ngDialog, $http, $sce, $rootScope) {
    var vm = this;
    vm.showLoader = false;
    vm.data = DataFactory;
    vm.onTapSendUser = onTapSendUser;
    vm.onTapRemoveNewNumber = onTapRemoveNewNumber;
    vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
    vm.validarCEP = validarCEP;
    vm.validarCPF = validarCPF;
    vm.validatePhoneNumber = validatePhoneNumber;
    // vm.getContactParentName = getContactParentName;
    vm.showAddNewPhone = showAddNewPhone;
    vm.goBack = goBack;
    vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '';
    var index = $stateParams.data ? $stateParams.data.index : '';
    vm.singlePriceLocal = 0;
    vm.allOperatorOptions = MainUtils.operatorOptions();
    vm.requesting = true;
    vm.onCheckCNPJ = onCheckCNPJ
    vm.CNPJField = false;
    vm.CPFField = true;
    vm.opemEmailpopup = opemEmailpopup;

    vm.search = "";
    vm.showall = false;
    vm.linhaAtiva = false;
    vm.claro = true;
    vm.vivo = true;
    vm.history = [];
    vm.sp = 1;

    function opemEmailpopup(emailstatus, phone, email, operator) {
      ViewModelUtilsService.showModalEmailDetail(emailstatus, phone, email, operator);
    }

    function onCheckCNPJ() {
      console.log("andando " + vm.checkboxCNPJ)

      if (vm.checkboxCNPJ) {
        onShowCNPJField();
      }
      else {
        onShowCPFField();
      }

    }

    function onShowCPFField() {
      vm.CNPJField = false;
      vm.CPFField = true;
    }

    function onShowCNPJField() {
      vm.CNPJField = true;
      vm.CPFField = false;
    }




    init();
    function init() {
      if (!vm.cpf) {
        FlowManagerService.changeCustomersView();
        return;
      }
      var showDialog = DialogFactory.showLoader('Carregando dados...');
      FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function (result) {
        vm.DocumentNumberFreeze = angular.copy(result.DocumentNumber);
        vm.customer = result;


        getPersonParent(vm.customer.IdParent);
        vm.singlePriceLocal = vm.customer.SinglePrice ? vm.customer.SinglePrice : 0; //single place formatado;
        if (vm.customer.Adresses) {
          for (var i = 0; i < vm.customer.Adresses.length; i++) {
            vm.customer.Adresses[i].StreetNumber = parseInt(vm.customer.Adresses[i].StreetNumber); //deve ser int por causa da mascara
          }
        }

        FoneclubeService.getPlans().then(function (result) {
          vm.plans = result;
          debugger;
          var listaPlanosUsados = [];

          for (var number in vm.customer.Phones) {
            vm.customer.Phones[number].key = Math.random();

            vm.customer.Phones[number].StatusOperator = { 'background-color': 'grey' }
            vm.customer.Phones[number].StatusDescription = 'C'

            debugger
            // if(number % 2)
            // {
            //     vm.customer.Phones[number].StatusOperator = {'background-color':'green'}
            //     vm.customer.Phones[number].StatusDescription = 'A' 
            // }
            // else
            // {
            //     vm.customer.Phones[number].StatusOperator = {'background-color':'red'}
            //     vm.customer.Phones[number].StatusDescription = 'B'
            // }

            //vm.customer.Phones[number].IdOperator = vm.customer.Phones[number].IdOperator.toString(); //deve ser string por causa do ng-options
            //vm.customer.Phones[number].IdPlanOption = vm.customer.Phones[number].IdPlanOption.toString(); //deve ser string por causa do ng-options
            if (vm.customer.Phones[number].Portability) {
              vm.customer.Phones[number].Portability = 'true';
            } else {
              vm.customer.Phones[number].Portability = 'false';
            }
            vm.customer.Phones[number].NovoFormatoNumero = getNumberString(vm.customer.Phones[number]); //popula o novo campo vm.<telefone>
            for (var plan in vm.plans) {

              listaPlanosUsados.push(vm.customer.Phones[number].IdPlanOption);

              if (vm.plans[plan].Id == vm.customer.Phones[number].IdPlanOption) {
                if (vm.plans[plan].Description.endsWith('VIVO')) {
                  vm.customer.Phones[number].operadora = '1'; //seta a operadora local

                  vm.customer.Phones[number].StatusOperator = { 'background-color': 'green' }
                  vm.customer.Phones[number].StatusDescription = 'A'
                } else {
                  vm.customer.Phones[number].operadora = '2'; //seta a operadora local

                  console.log('tentando coletar')
                  FoneclubeService.getStatusBlockedClaro(vm.customer.Phones[number].DDD, vm.customer.Phones[number].Number).then(function (result) {
                    console.log('retorno ' + result)
                    if (!result) {
                      vm.customer.Phones[number].StatusOperator = { 'background-color': 'green' }
                      vm.customer.Phones[number].StatusDescription = 'A'
                    }
                    else {
                      vm.customer.Phones[number].StatusOperator = { 'background-color': 'red' }
                      vm.customer.Phones[number].StatusDescription = 'B'
                    }

                  });

                }
              }
            }



          }

          listaPlanosUsados = listaPlanosUsados.filter(vm.onlyUnique)
          for (var i in listaPlanosUsados) {
            debugger
            var teste = listaPlanosUsados[i];
          }

          console.info(vm.customer);

          populaPai(vm.customer)
          showDialog.close();
          // Fix caso não exista numero de telefone -- É necessário manter esse fix por causa de clientes que tenham esse array vazio
          var dontHaveContact = vm.customer.Phones.filter(function (element, index, array) {
            return element.IsFoneclube == null || element.IsFoneclube == false;
          });
          if (dontHaveContact.length == 0) {
            vm.customer.Phones.push({
              'Id': null,
              'DDD': '',
              'Number': '',
              'IsFoneclube': null,
              'IdOperator': 0,
              'Portability': 'false',
              'NickName': '',
              'IdPlanOption': 0,
              'Inative': false,
              'Delete': false,
              'NovoFormatoNumero': '',
              'operadora': '1',
              'key': Math.random()
            });
          }

          // Fix caso não exista endereço -- É necessário manter esse fix por causa de clientes que tenham esse array vazio
          if (vm.customer.Adresses.length == 0) {
            vm.customer.Adresses.push({
              Cep: '',
              Street: '',
              StreetNumber: '',
              Complement: '',
              Neighborhood: '',
              City: '',
              State: ''
            });
          }

          $timeout(function () {
            vm.requesting = false;
          }, 2000)

          $timeout(function () {
            document.getElementById('cpf').focus();
          }, 200);

          vm.pricelist = [];
          for (var i = 0; i < vm.customer.Phones.length; i++) {
            var phoneNumber = vm.customer.Phones[i];
            if (phoneNumber.IdPlanOption == '') {
              vm.pricelist.push(0);
            } else {
              vm.pricelist.push(vm.plans.find(x => x.Id == phoneNumber.IdPlanOption).Value / 100);
            }
          }

          vm.tempPhones = angular.copy(vm.customer.Phones);

          vm.sp = 1;
          addHistory();
        });

      });
    };


    vm.loading = false;
    vm.autoCompleteOptions = {
      minimumChars: 1,
      //selectedTextAttr: 'PhoneParent',
      data: function (searchTerm) {
        return FoneclubeService.getAllParents()
          .then(function (response) {
            vm.loading = true;
            console.log(response);
            // ideally filtering should be done on server
            searchTerm = searchTerm.toUpperCase();


            return _.filter(response, function (info) {
              if (info.NameParent != null)
                //return info.NameParent.startsWith(searchTerm);
                return removeAccents(info.NameParent.toString().toLowerCase()).indexOf(removeAccents(searchTerm.toLowerCase())) > -1;
            });

            // var match = _.filter(response, function (info) {                                
            //     //alert(info.NameParent);
            //     if(info.NameParent != null)
            //         //return info.NameParent.startsWith(searchTerm);
            //         return removeAccents(info.NameParent.toString().toLowerCase()).indexOf(removeAccents(searchTerm.toLowerCase())) > -1;
            // });

            // vm.loading = false;
            // return _.pluck(match, 'NameParent');
          }).catch(function (error) {
            console.log('error: ' + error);
          });
      },
      renderItem: function (item) {
        return {
          value: item.NameParent,
          label: $sce.trustAsHtml(
            "<p class='auto-complete' style='margin-bottom:0px;'>"
            + item.NameParent +
            "</p>")
        };
      },
      itemSelected: function (e) {
        //vm.contactParent="(21) 98156-7560";
        //alert(JSON.stringify(e));
        var contactNo = "(" + e.item.DDDParent + ") " + e.item.PhoneParent.toString().substring(0, 5) + "-" + e.item.PhoneParent.toString().substring(5, 9);
        vm.contactParent = contactNo;
      }
    }

    vm.getParentDataByPhone = getParentDataByPhone;

    function getParentDataByPhone(phoneparent, personid) {
      //alert(phoneparent+ " "+personid);
      if (phoneparent && personid) {
        phoneparent = phoneparent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(2, 11);
        FoneclubeService.getCustomerParentByPhone(phoneparent, personid).then(function (result) {
          console.log(result);
          //alert(phoneparent);
          //alert(personid);
          vm.customer.NameContactParent = result.NameParent;
        }).catch(function (error) {
          console.log('error: ' + error);
        });
      }
    };

    function populaPai(customer) {

      vm.customer.NameContactParent = customer.NameParent;

      if (customer.PhoneDDDParent != null && customer.PhoneNumberParent != null)
        vm.contactParent = customer.PhoneDDDParent + customer.PhoneNumberParent;

    }

    function getPersonParent(id) {
      if (id) {
        FoneclubeService.getCustomerById(id).then(function (result) {
          if (result.Phones.length > 0) {
            vm.contactParent = result.Phones[0].DDD.concat(result.Phones[0].Number);
          }
        }).catch(function (error) {
          console.log('error: ' + error);
        });
      }
    }

    function getFormatedDate(param) {
      var date = new Date(param);
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      if (day < 10) { day = "0" + day; }
      if (month < 10) { month = "0" + month; }
      return day + '/' + month + '/' + year;
    }

    function onTapSendUser(customer) {

      debugger;
      if (vm.requesting == true) return;
      vm.requesting = true;

      //debugger;
      //return;

      //TODO
      //colocar breakpoint nos metodos localhost API, validar se novos atributos chegam--Putting breakpoint the methods localhost API, validate the new assets come.
      //revisar todos nomes entidade .net apos refact de nomes atributos -- Revisar of names or. net apos refact of attributes.
      var customerSend = {
        "Id": customer.Id,
        "DocumentNumber": UtilsService.clearDocumentNumber(customer.DocumentNumber),
        "Register": customer.Register,
        "Name": customer.Name,
        "NickName": customer.NickName,
        "Email": customer.Email,
        "Born": customer.Born,
        "Gender": customer.Gender,
        "IdPlanOption": customer.IdPlanOption,
        "IdPagarme": customer.IdPagarme,
        "IdRole": customer.IdRole,
        "Adresses": customer.Adresses,
        "Phones": customer.Phones,
        "Photos": customer.Photos,
        "IdParent": customer.IdParent,
        "NameContactParent": customer.NameContactParent,
        "IdCommissionLevel": customer.IdCommissionLevel,
        "SinglePrice": vm.singlePriceLocal,
        "DescriptionSinglePrice": customer.DescriptionSinglePrice
      }
      var totalPriceValidade = 0;
      for (var i in vm.customer.Phones) {
        vm.plans.find(function (element, index, array) {
          if (element.Id == vm.customer.Phones[i].IdPlanOption) {
            totalPriceValidade = totalPriceValidade + element.Value / 100;
          }
        });
      }
      if (vm.singlePriceLocal) {
        if ((vm.singlePriceLocal / 100) > totalPriceValidade) {
          DialogFactory.showMessageDialog({ mensagem: 'Preço único não pode ser maior do que o preço de todos os planos somados.' });
          //showLoader.close();
          vm.requesting = false;
          return;
        }
      }


      var digitosMinimosTelefone = 11
      //Regra: o telefone não pode ser incompleto, mass pode estar em branco
      for (var item in customerSend.Phones) {
        if (customerSend.Phones[item].NovoFormatoNumero.length < digitosMinimosTelefone && customerSend.Phones[item].NovoFormatoNumero.length > 0) {
          debugger;
          DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'O telefone: '.concat(customerSend.Phones[item].NovoFormatoNumero).concat(', não pode ficar incompleto, mas pode ficar em branco.') });
          //showLoader.close();
          vm.requesting = false;
          return;
        } else {
          
          customerSend.Phones[item].DDD = UtilsService.getPhoneNumberFromStringToJson(customerSend.Phones[item].NovoFormatoNumero).DDD;
          customerSend.Phones[item].Number = UtilsService.getPhoneNumberFromStringToJson(customerSend.Phones[item].NovoFormatoNumero).Number;
        }
      }

      var arrayFiltered = customerSend.Phones.filter(function (number) {
        return number.IsFoneclube == true && number.DDD.length == 2 && number.Number.length >= 8 && number.Delete == null && number.LinhaAtiva;
      });

      //Fix se o usuario não add CEP o array deve estar vazio;
      for (var i in customerSend.Adresses) {
        if (customerSend.Adresses[i].Cep == '')
          customerSend.Adresses.splice(i, 1);
      }
      var showLoader = DialogFactory.showLoader('Enviando Dados...');
      if (arrayFiltered.length == 0) {
        runPostUpdateCustomer(customerSend);
      } else {
        validadeNumbers(arrayFiltered).then(function (result) {
          var right = true;
          for (var item in result) {
            if (result[item].DocumentNumber && result[item].DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)) {
              
              debugger;
              var msg = 'Você não pode cadastrar o mesmo telefone para dois clientes.</br>O número <strong>'
                .concat(arrayFiltered[item].NovoFormatoNumero).concat('</strong>, pertence ao cliente ')
                .concat(result[item].DocumentNumber).concat(', ').concat(result[item].Name).concat('.');
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: msg });
              right = false;
              vm.requesting = false;
              showLoader.close();
            }
          }
          for (var x in arrayFiltered) {
            //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
            var twiceNumber = arrayFiltered.filter(function (element, index, array) {
              return element.DDD == arrayFiltered[x].DDD && element.Number == arrayFiltered[x].Number;
            });
            if (twiceNumber.length > 1) {
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.' });
              right = false;
              vm.requesting = false;
              showLoader.close();
              break;
            }
          }
          if (right) {
            runPostUpdateCustomer(customerSend);
          }
        });
      }

      function runPostUpdateCustomer(customerSend) {
        debugger;
        UtilsService.sendImageToUpload(vm.imageSelf, vm.imageFrente, vm.imageVerso).then(function (result) {
          for (var i in result) {
            customerSend.Photos = customerSend.Photos.filter(function (element) {
              return element.Tipo != result[i].tipo;
            });
            // for (var x in customerSend.Photos) {
            //     if (result[i].tipo == customerSend.Photos[x].Tipo) {
            //         debugger;
            //         customerSend.Photos.splice(x, 1);
            //     }
            // }
            customerSend.Photos.push({ Name: result[i].filename, Tipo: result[i].tipo });
          }

          var parentDDD = vm.contactParent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(0, 2);
          var parentNumber = vm.contactParent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(2, 11);
          var parentName = vm.customer.NameContactParent;
          // debugger;


          var customerObj = {
            'NameParent': vm.customer.NameContactParent,
            'Id': customerSend.Id,
            'PhoneDDDParent': parentDDD,
            'PhoneNumberParent': parentNumber
          }
          debugger;
          FoneclubeService.postCustomerParent(customerObj).then(function (result) {
            // debugger;
            if (result)
              FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucess).catch(postUpdateCustomerError);
            else {
              DialogFactory.dialogConfirm({ title: 'Andamento editar', mensagem: 'Não foi possível atualizar dados do pai da linha, deseja salvaro restante ( reomendável que sim ):', btn1: 'sim', btn2: 'não' })
                .then(function (result) {
                  if (result) {
                    FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucess).catch(postUpdateCustomerError);
                  } else {
                    return;
                  }
                })
            }
          }).catch(function (erro) {

            DialogFactory.dialogConfirm({ title: 'Andamento editar', mensagem: 'Não foi possível atualizar dados do pai da linha, deseja salvaro restante ( reomendável que sim ):', btn1: 'sim', btn2: 'não' })
              .then(function (result) {
                if (result) {
                  FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucess).catch(postUpdateCustomerError);
                } else {
                  return;
                }
              })

          });






        })

      }

      function postUpdateCustomerSucess(result) {
        if (result) {
          DialogFactory.dialogConfirm({ title: 'Edição Realizada', mensagem: 'Todos os dados pessoais enviados, edição Foneclube feita com sucesso.', btn1: 'Ir para Home', btn2: 'Visualizar Cliente' })
            .then(function (result) {
              if (result) {
                FlowManagerService.changeCustomersView();
                FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function (result) {
                  vm.data.customers.splice(index, 1, result);
                  ViewModelUtilsService.showModalCustomer(result);
                });
              } else {
                FlowManagerService.changeHomeView();
              }
            })
        }
        vm.requesting = false;
        showLoader.close();
      }

      function postUpdateCustomerError(error) {
        DialogFactory.showMessageDialog({ mensagem: error.statusText });
        vm.requesting = false;
        showLoader.close();
      }
    };

    function setPlansList(operadora) {
      vm.selectedPlansList = [];
      for (var item in vm.plans) {
        if (operadora == 1 && vm.plans[item].Description.endsWith('VIVO')) {
          vm.selectedPlansList.push(vm.plans[item]);
        } else if (operadora == 2 && vm.plans[item].Description.endsWith('CLARO')) {
          vm.selectedPlansList.push(vm.plans[item]);
        }
      }
    }

    function validarCEP(index) {
      if (vm.customer.Adresses[index].Cep.length < 9) return;
      var showLoader = DialogFactory.showLoader('Tentando preencher dados...');
      HubDevService.validaCEP(vm.customer.Adresses[index].Cep.replace(/[-.]/g, '')).then(function (result) {
        if (!result.erro) {
          vm.customer.Adresses[index].Street = result.logradouro;
          vm.customer.Adresses[index].Neighborhood = result.bairro;
          vm.customer.Adresses[index].City = result.localidade;
          vm.customer.Adresses[index].State = result.uf;
        } else {
          DialogFactory.showMessageDialog({ mensagem: "CEP incorreto." });
        }
        showLoader.close();
      }, function (error) {
        showLoader.close();
      });
    }

    function validarCPF() {
      if (vm.customer.DocumentNumber.length < 11) { return }
      FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)).then(function (existentClient) {
        if (existentClient.Id == 0) {
          HubDevService.validaCPF(UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)).then(function (result) {
            if (result.status) {
              vm.name = result.nome;
            }
          }, function (error) { });
        } else if (existentClient.DocumentNumber != vm.DocumentNumberFreeze) {
          DialogFactory.showMessageConfirm({ titulo: 'CPF já cadastrado', mensagem: 'Você não pode cadastrar um cpf repetido.' })
            .then(function (param) {
              var cpf = angular.copy(vm.DocumentNumberFreeze);
              vm.customer.DocumentNumber = cpf.substr(0, 3) + '.' + cpf.substr(3, 3) + '.' + cpf.substr(6, 3) + '-' + cpf.substr(9)
            })
        }
      }, function (result) {
        FlowManagerService.changeHomeView();
      }).catch(function (error) {
        FlowManagerService.changeHomeView();
      });
    }

    // function getContactParentName() {
    //     if (vm.contactParent.length < 13) { 
    //         vm.customer.IdParent = "";
    //         return
    //     }
    //     var param = {
    //         ddd: clearPhoneNumber(vm.contactParent).substring(0, 2),
    //         numero: clearPhoneNumber(vm.contactParent).substring(2)
    //     }
    //     FoneclubeService.getCustomerByPhoneNumber(param).then(function(result) {
    //         vm.customer.IdParent = result.Id;
    //         vm.customer.NameContactParent = result.Name;
    //     })
    // }

    function onTapNewPhoneNumber() {
      vm.customer.Phones.push(
        {
          'Id': null,
          'DDD': '',
          'Number': '',
          'IsFoneclube': true,
          'IdOperator': 0,
          'Portability': 'false',
          'NickName': '',
          'IdPlanOption': 0,
          'Inative': false,
          'Delete': null,
          'NovoFormatoNumero': '',
          'operadora': '1',
          'key': Math.random(),
          'LinhaAtiva': true
        }
      );
      resizeScroll();
    }

    function onTapRemoveNewNumber(position) {
      DialogFactory.dialogConfirm({ titulo: 'Excluir Número', mensagem: 'Deseja realmente remover este número?' })
        .then(function (res) {
          if (res) {
            if (vm.customer.Phones[position].Id !== null) {
              vm.customer.Phones[position].Delete = true;
            } else {
              vm.customer.Phones.splice(position, 1);
            }

          }
        })
    }

    function validadeNumbers(numbers) {
      var promises = numbers.map(function (number) {
        return FoneclubeService.getCustomerByPhoneNumber({
          ddd: clearPhoneNumber(number.DDD),
          numero: clearPhoneNumber(number.Number)
        });
      });
      return $q.all(promises);
    }

    function validatePhoneNumber(position) {
      if (vm.requesting || vm.customer.Phones[position].NovoFormatoNumero.length < 14) return;
      var number = {
        ddd: UtilsService.getPhoneNumberFromStringToJson(vm.customer.Phones[position].NovoFormatoNumero).DDD,
        numero: UtilsService.getPhoneNumberFromStringToJson(vm.customer.Phones[position].NovoFormatoNumero).Number
      }
      //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
      var twiceNumber = vm.customer.Phones.filter(function (element, index, array) {
        return element.NovoFormatoNumero == vm.customer.Phones[position].NovoFormatoNumero
          && element.IsFoneclube == true
          && element.Delete == null;
      });
      if (twiceNumber.length > 1) {
        DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.' });
        return;
      }
      FoneclubeService.getCustomerByPhoneNumber(number).then(function (res) {
        if (res.DocumentNumber && res.DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)) {
          DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Este telefone já pertence a um cliente.' });
        }
      });
    }

    function getNumberString(param) {
      return param.DDD.concat(param.Number);
    }

    function clearPhoneNumber(number) {
      return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : '';
    }

    function showAddNewPhone() {
      function filterPhones(number) {
        return number.IsFoneclube == true;
      }
      return vm.customer.Phones.filter(filterPhones);
    }

    function goBack() {
      FlowManagerService.goBack();
      FoneclubeService.getCustomerByCPF(vm.cpf).then(function (result) {
        ViewModelUtilsService.showModalCustomer(result);
      });
    }

    function resizeScroll() {
      $ionicScrollDelegate.resize();
    }

    vm.imageSelf;
    vm.base64Self;
    vm.imageFrente;
    vm.base64Frente;
    vm.imageVerso;
    vm.base64Verso;
    vm.uploadImg = uploadImg;
    vm.viewImg = viewImg;
    function viewImg(img) {
      ngDialog.open({
        template: '<div class="popup-lista-imagens ngdialog-close"><img ng-src="{{img}}"/></div>',
        controller: ['$scope', 'DataFactory', function ($scope, DataFactory) {
          $scope.img = $scope.ngDialogData.img;
        }],
        className: 'ngDialog-custom-width popup-lista-imagens',
        plain: true,
        closeByDocument: true,
        data: {
          img: img
        }
      });
    }
    function uploadImg(param) {
      document.getElementById(param).click();
    }
    vm.getImageOftype = getImageOftype;
    function getImageOftype(type) {
      function base64img(tipo) {
        if (tipo == 1) {
          return vm.base64Self;
        } else if (tipo == 2) {
          return vm.base64Frente;
        } else if (tipo == 3) {
          return vm.base64Verso;
        }
        return null;
      }
      if (base64img(type)) {
        return base64img(type);
      }
      var img = vm.customer.Photos.filter(function (element) {
        return element.Tipo == type;
      });
      if (img[0]) {
        return 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + img[0].Name;
      }
      return '../../content/img/upload-cloud.png';
    }

    vm.onlyUnique = onlyUnique;

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    vm.getPrice = getPrice;
    function getPrice(id) {
      console.log(id);
      if (id == '')
        return 0;
      return vm.plans.find(x => x.Id == id).Value / 100;
    }

    vm.changedPlano = changedPlano;
    function changedPlano(position, id) {

      if (id == '' || id == null)
        vm.pricelist[position] = 0;
      else
        vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
      addHistory();
      autmaticSum();
    }

    vm.onSendUser = onSendUser;
    function onSendUser(customer) {

        var customerSend = {
            "Id": customer.Id,
            "DocumentNumber": UtilsService.clearDocumentNumber(customer.DocumentNumber),
            "Register": customer.Register,
            "Name": customer.Name,
            "NickName": customer.NickName,
            "Email": customer.Email,
            "Born": customer.Born,
            "Gender": customer.Gender,
            "IdPlanOption": customer.IdPlanOption,
            "IdPagarme": customer.IdPagarme,
            "IdRole": customer.IdRole,
            "Adresses": customer.Adresses,
            "Phones": customer.Phones,
            "Photos": customer.Photos,
            "IdParent": customer.IdParent,
            "NameContactParent": customer.NameContactParent,
            "IdCommissionLevel": customer.IdCommissionLevel,
            "SinglePrice": customer.SinglePrice,
            "DescriptionSinglePrice": customer.DescriptionSinglePrice
        }

        FoneclubeService.postUpdateCustomer(customerSend).then(function(result){
            vm.showLoader = false;
        })
    };

    vm.onchecked = onchecked;
    function onchecked(position) {
      vm.customer.Phones[position] = angular.copy(vm.tempPhones[position]);
      vm.showLoader = true;
      onSendUser(vm.customer);
    }

    vm.onfocusPreco = onfocusPreco;
    function onfocusPreco(position){
        vm.tempPrice = vm.pricelist[position];
    }

    vm.onBlurPreco = onBlurPreco;
    function onBlurPreco(position){
        if(vm.tempPrice != vm.pricelist[position]){
            addHistory();
        }
    }

    vm.onunchecked = onunchecked;
    function onunchecked(position) {
      vm.tempPhones[position] = angular.copy(vm.customer.Phones[position]);
      var id = vm.tempPhones[position].IdPlanOption;
      if (id == '' || id == null)
        vm.pricelist[position] = 0;
      else
        vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
    }

    vm.onallchecked = onallchecked;
    function onallchecked() {
      vm.customer.Phones = angular.copy(vm.tempPhones);
      vm.showLoader = true;
      onSendUser(vm.customer);
    }

    vm.onallunchecked = onallunchecked;
    function onallunchecked() {
      vm.tempPhones = angular.copy(vm.customer.Phones);
      for (var position = 0; position < vm.tempPhones.length; position++) {
        var id = vm.tempPhones[position].IdPlanOption;
        if (id == '' || id == null)
          vm.pricelist[position] = 0;
        else
          vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
      }
    }

    vm.onedit = onedit;
    function onedit() {
      ViewModelUtilsService.showModalCustomer(vm.customer, -1);
    }

    vm.ignoreAccents = function (item) {
      if (vm.showall) {
        return true;
      } else {
        var text = removeAccents(item.NovoFormatoNumero.toLowerCase());
        //alert(text);
        var search_text = removeAccents(vm.search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, ''));
        var flag1 = text.indexOf(search_text) > -1;
        var flag2 = true;
        if (vm.linhaAtiva && !item.LinhaAtiva) {
          flag2 = false;
        }
        var flag3 = true;
        if (!vm.claro) {
          var itm = vm.plans.find(x => x.Id == item.IdPlanOption);
          if (!itm) {
            flag3 = false;
          } else {
            text = removeAccents(itm.Description.toLowerCase());
            flag3 = !(text.indexOf('claro') > -1);
          }
        }
        var flag4 = true;
        if (!vm.vivo) {
          var itm = vm.plans.find(x => x.Id == item.IdPlanOption);
          if (!itm) {
            flag4 = false;
          } else {
            text = removeAccents(itm.Description.toLowerCase());
            flag4 = !(text.indexOf('vivo') > -1);
          }
        }

        return flag1 && flag2 && flag3 && flag4;

      }
    };

    vm.changedFilterAll = changedFilterAll;
    function changedFilterAll() {
      if (vm.showall) {
        vm.search = "";
        vm.linhaAtiva = false;
        vm.claro = true;
        vm.vivo = true;
      }
    }

    vm.onUndo = onUndo;
    function onUndo() {
      vm.sp--;
      var tmp = angular.copy(vm.history[vm.sp - 1]);
      vm.tempPhones = tmp.phones;
      vm.pricelist = tmp.pricelist;
      for (var position = 0; position < vm.tempPhones.length; position++) {
        var id = vm.tempPhones[position].IdPlanOption;
 /*       if (id == '' || id == null)
          vm.pricelist[position] = 0;
        else
          vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
          */
      }
    }

    vm.onRedo = onRedo;
    function onRedo() {
      vm.sp++;
      var tmp = angular.copy(vm.history[vm.sp - 1]);
      vm.tempPhones = tmp.phones;
      vm.pricelist = tmp.pricelist;
      for (var position = 0; position < vm.tempPhones.length; position++) {
        var id = vm.tempPhones[position].IdPlanOption;
/*        if (id == '' || id == null)
          vm.pricelist[position] = 0;
        else
          vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
          */
      }
    }

    vm.addHistory = addHistory;
    function addHistory() {
      if (vm.history.length > vm.sp) {
        vm.history.splice(vm.sp, vm.history.length - vm.sp);
      }
      var tmpPhones = angular.copy(vm.tempPhones);
      var tmpPricelist = angular.copy(vm.pricelist);
      vm.history.push({ 'phones': tmpPhones, 'pricelist': tmpPricelist });
      vm.sp = vm.history.length;
    }

    vm.telephonechanged = telephonechanged;
    function telephonechanged($index) {
      //    addHistory();
    }

    vm.activechanged = activechanged;
    function activechanged($index) {
      addHistory();
    }


    vm.pricechanged = pricechanged;
    function pricechanged($index) {
      autmaticSum();
    }

    vm.nicknamechanged = nicknamechanged;
    function nicknamechanged($index) {
      addHistory();
    }

    vm.changedAutoSum = changedAutoSum;
    function changedAutoSum() {
      if (vm.autoSum) {
        autmaticSum();
      }
    }

    function autmaticSum() {
      if (vm.autoSum) {
        vm.singlePriceLocal = 0;
        for (var i = 0; i < vm.pricelist.length; i++) {
          vm.singlePriceLocal += vm.pricelist[i] ;
        }
     //   vm.singlePriceLocal = vm.singlePriceLocal / 100;
     vm.singlePriceLocal = vm.singlePriceLocal.toFixed(2);
      }
    }

  }
})();
