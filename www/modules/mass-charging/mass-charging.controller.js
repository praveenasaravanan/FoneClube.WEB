(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('MassChargingController', MassChargingController);

    MassChargingController.inject = ['$scope', 'FoneclubeService', 'PagarmeService', '$q', 'UtilsService', '$timeout'];

    function MassChargingController($scope, FoneclubeService, PagarmeService, $q, UtilsService, $timeout) {
        var vm = this;
        vm.chargePhoneNumber = chargePhoneNumber;
        vm.searchMassCharging = searchMassCharging
        vm.viewName = "Cobrança em massa";
        vm.doMassCharge = doMassCharge;
        //vm.loading = true;
        vm.year = new Date().getFullYear();
        vm.month = new Date().getMonth() + 1 - 3;

        init();
        function init() {
            vm.loading = true;
            FoneclubeService.getChargingClients({month: vm.month, year: vm.year}).then(function(result) {
                console.log(result);
                vm.lista = result;
                vm.loading = false;
            }).catch(function (error) {
                vm.lista = [];
                vm.loading = false;
                console.log(error);
            });
        }

        function validationPhone(phone) {
            if (!phone.typeCharging) {
                showSimpleToast("É obrigatório informar o tipo de cobrança. Linha: " + phone.NickName);
                return false;
            } else if ((phone.typeCharging == 'boletoBS' || phone.typeCharging == 'boletoPG') && (!phone.commentBoleto || phone.commentBoleto.length == 0 )) {
                showSimpleToast("É obrigatório informar comentário para cobrança por boleto. Linha: " + phone.NickName);
                return false;
            } else if (!phone.Chargings[0].Ammount) {
                showSimpleToast("É obrigatório informar a quantia para cobrança. Linha: " + phone.NickName);
                return false;
            }
            return true;
        }

        function validationsCustomer(customer) {
            if (!getAddress(customer) || !getContactPhone(customer)) {
                delete phone.statusOnCharging;
                return false;
            }
            if (!customer.IdPagarme) {
                showSimpleToast('Não há conta pagar-me para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
                delete phone.statusOnCharging;
                return false;
            }
            return true;
        }

        function chargePhoneNumber(customer, phone) {
            if (!phone.statusOnCharging) {
                phone.statusOnCharging = 1;
                return;
            }
            if (phone.statusOnCharging == 1) {
                if (!validationPhone(phone)) {
                    delete phone.statusOnCharging;
                    return;
                }
                phone.statusOnCharging = 2;
                processCharging(customer, phone);
            }
            if (phone.statusOnCharging == 4) {
                showSimpleToast(phone.errorMsg);
            }
        }

        function processCharging(customer, phone) {
            if (!validationsCustomer(customer)) return;

            if (phone.typeCharging == 'boletoBS') {
                chargeBoletoBS(customer, phone).then(function (result) {
                    phone.statusOnCharging = 3;
                }).catch(function (error) {
                    phone.statusOnCharging = 4;
                    showSimpleToast(error);
                })
            } else if (phone.typeCharging == 'boletoPG') {
                chargeBoletoPG(customer, phone).then(function (result) {
                    phone.statusOnCharging = 3;
                }, function (reject) {
                    showSimpleToast(reject.msg);
                    phone.errorMsg = reject.msg;
                    if (reject.block) {
                        phone.statusOnCharging = 4;
                    } else {
                        delete phone.statusOnCharging;
                    }
                }).catch(function (error) {
                    phone.statusOnCharging = 4;
                    showSimpleToast(error);
                });
            } else if (phone.typeCharging == 'cartao') {
                chargeCreditCart(customer, phone).then(function (result) {
                    phone.statusOnCharging = 3;
                }, function (reject) {
                    showSimpleToast(reject.msg);
                    phone.errorMsg = reject.msg;
                    if (reject.block) {
                        phone.statusOnCharging = 4;
                    } else {
                        delete phone.statusOnCharging;
                    }
                }).catch(function (error) {
                    phone.statusOnCharging = 4;
                    console.log(error);
                    showSimpleToast(error);
                });
            }
        }

        function chargeBoletoBS(customer, phone) {
            var defer = $q.defer();
            var param = {
                "ClientId" : customer.Id,
                "PhoneId" : phone.Id,
                "Ammount": phone.Chargings[0].Ammount,
                "Comment": phone.commentBoleto || '',
                "PaymentType": 3
            }
            FoneclubeService.postChargingClient(vm.year, vm.month, param).then(function (result) {
                defer.resolve({result: 'sucesso', phoneId: phone.Id, customerId: customer.Id});
            }).catch(function (error) {
                defer.reject(error);
            });
            return defer.promise; 
        }

        function chargeBoletoPG(customer, phone) {
            var defer = $q.defer();
            var foneclubeCustomer = {
                "ClientId" : customer.Id,
                "PhoneId" : phone.Id,
                "Ammount": phone.Chargings[0].Ammount,
                "Comment": phone.commentBoleto || '',
                "PaymentType":  2
            }
            var pagarmeCustomer = {
                'name' : customer.Name,
                'document_number' : customer.DocumentNumber,
                'email' : customer.Email,
                'address' : getAddress(customer),
                'phone' : getContactPhone(customer)
            }
            var instructions = 'FoneClub - 2017'

            FoneclubeService.postChargingClient(vm.year, vm.month, foneclubeCustomer).then(function (result) {
                console.log(result);
                phone.transactionId = result;
                PagarmeService.postBoleto(phone.Chargings[0].Ammount, instructions, pagarmeCustomer).then(function(result) {
                    console.log(result);
                    PagarmeService.postCaptureTransaction(result.token, phone.Chargings[0].Ammount).then(function(resultCapture) {
                        try{
                            PagarmeService.notifyCustomerBoleto(resultCapture.id, pagarmeCustomer.email).then(function(resultNotify) {
                                console.log('Boleto gerado com sucesso');
                            }).catch(function(error) {
                                console.log('Produção funciona');
                            });
                        } catch(erro){
                            console.log(erro);
                            console.log('Produção funciona');
                        }
                        //saveHistoryPayment(resultCapture.id, resultCapture.acquirer_id);
                        //CONFIRMAR COM CARDOZO O LOCAL DESSA PROXIMA CHAMADA;
                        var confirmCharge = {
                            'ClientId': customer.Id,
                            'PaymentStatus': 3,
                            'TransactionComment': "OK",
                            'BoletoId': resultCapture.id,
                            'AcquireId': resultCapture.acquirer_id
                        }
                        FoneclubeService.postChargingClientCommitCard(vm.year, vm.month, phone.transactionId, confirmCharge).then(function (result) {
                            console.log(result);
                            defer.resolve({result: 'sucesso', phoneId: phone.Id, customerId: customer.Id});
                        }).catch(function (error) {
                            defer.resolve({result: 'sucesso', phoneId: phone.Id, customerId: customer.Id});
                            console.log(error);
                            console.log("Houve erro mas a cobrança foi realizada");//Falar com Cardozo;
                        });
                    }).catch(function(error) {
                        defer.reject({block: true , msg: 'Erro na captura da transação ' + error.status});
                    });
                }, function (error) {
                    defer.reject({block: true , msg: 'Erro ao realizar transação, verifique os dados do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber});
                }).catch(function (error) {
                    defer.reject({block: true , msg: 'Erro ao realizar transação, verifique os dados do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber});
                });
            }).catch(function() {
                defer.reject({block: true , msg: error});
            });
            return defer.promise;
        }

        function chargeCreditCart(customer, phone) {
            var defer = $q.defer();
            var foneclubeCustomer = {
                "ClientId" : customer.Id,
                "PhoneId" : phone.Id,
                "Ammount": phone.Chargings[0].Ammount,
                "Comment": phone.commentBoleto || '',
                "PaymentType":  1
            }
            var pagarmeCustomer = {
                'name' : customer.Name,
                'document_number' : customer.DocumentNumber,
                'email' : customer.Email,
                'address' : getAddress(customer),
                'phone' : getContactPhone(customer)
            }

            var card = null;
            //TODO REMOVER ID DO CARTAO DE CREDITO!!!!!!!!!!!!!!!!!!!!!!!!!!
            PagarmeService.getCard(326405).then(function(result) {
                if (result.length == 0) {
                    reject({block: true, msg:'Não há cartão de crédito cadastrado para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber});
                } else {
                    card = result[0];
                    FoneclubeService.postChargingClient(vm.year, vm.month, foneclubeCustomer).then(function (result) {
                        console.log(result);
                        phone.transactionId = result;
                        PagarmeService.postTransactionExistentCard(phone.Chargings[0].Ammount, card.id, pagarmeCustomer).then(function(result) {
                            PagarmeService.postCaptureTransaction(result.token, phone.Chargings[0].Ammount).then(function(result) {
                                //saveHistoryPayment();
                                var confirmCharge = {
                                    'ClientId': customer.Id,
                                    'PaymentStatus': 2,
                                    'TransactionComment': "OK"
                                }
                                FoneclubeService.postChargingClientCommitCard(vm.year, vm.month, phone.transactionId, confirmCharge).then(function (result) {
                                    console.log(result);
                                    defer.resolve({result: 'sucesso', phoneId: phone.Id, customerId: customer.Id});
                                }).catch(function (error) {
                                    defer.resolve({result: 'sucesso', phoneId: phone.Id, customerId: customer.Id});
                                    console.log(error);
                                    console.log("Houve erro mas a cobrança foi realizada");//Falar com Cardozo;
                                });
                            }).catch(function(error){
                                try{
                                    defer.reject({block: true , msg: 'Erro na captura da transação' + error.status});
                                } catch(erro) {
                                    defer.reject({block: true , msg: 'Erro na captura da transação'});
                                }
                            });
                        }).catch(function (error) {
                            defer.reject({block: true , msg: 'Erro ao realizar transação, verifique os dados do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber});
                        });
                    }).catch(function (error) {
                        defer.reject({block: true , msg: error});
                    });
                }
            }).catch(function(error){
                reject({block: false, msg:'falha ao recuperar cartão do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber});
            });
            return defer.promise;
        }

        function getContactPhone(customer){
            var contacts = UtilsService.getContactPhoneFromPhones(customer.Phones);
            if (!contacts || contacts.length == 0 || contacts[0].DDD == '' || contacts[0].Number == '') {
                console.log('É necessário cadastrar Telefone de Contato para este cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
                showSimpleToast('É necessário cadastrar Telefone de Contato para este cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
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
                console.log('É necessário cadastrar um Endereço para este cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
                showSimpleToast('É necessário cadastrar um Endereço para este cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
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

        vm.toastShow = false;
        vm.toastTimeOut = null;
        vm.toastMsg = ""
        function showSimpleToast(msg) {
            $timeout.cancel(vm.toastTimeOut);
            vm.toastMsg = msg;
            vm.toastShow = true;
            vm.toastTimeOut = $timeout(function () {
                vm.toastMsg = "";
                vm.toastShow = false;
            }, 2000);
        }

        //326405 pagarme
        //postChargingClientCommitCard

        // 1 = confirmação;
        // 2 = processando;
        // 3 = sucesso;
        // 4 = erro;

        function searchMassCharging() {
            init()
        }

        function doMassCharge() {
            vm.resquenting = true;
            var lista = angular.copy(vm.lista)
            var novaLista = [];
            for (var i in lista) {
                var toCharge = lista[i].Phones.filter(function (element) {
                    return element.checked == true;
                });
                if (toCharge.length > 0) {
                    var novoCliente = lista[i];
                    novoCliente.Phones = toCharge;
                    novaLista.push(novoCliente);
                }
            }
            if (novaLista.length == 0) {
                showSimpleToast("Selecione ao menos uma linha.");
                vm.resquenting = false;
            }
            var params = [];
            for (var i in novaLista) {
                if (!validationsCustomer(novaLista[i])) {
                    vm.resquenting = false;
                    return;
                }
                for (var y in novaLista[i].Phones) {
                    if (!validationPhone(novaLista[i].Phones[y])) {
                        vm.resquenting = false;
                        return;
                    } else {
                        params.push({customer: novaLista[i], linha: novaLista[i].Phones[y]});
                    }
                }
            }

            var promises = [];
            angular.forEach(params , function(param) {
                var promise = null
                if (param.linha.typeCharging == 'boletoBS') {
                    promise = chargeBoletoBS(param.customer, param.linha)
                } else if (param.linha.typeCharging == 'boletoPG') {
                    promise = chargeBoletoPG(param.customer, param.linha)
                } else if (param.linha.typeCharging == 'cartao') {
                    promise = chargeCreditCart(param.customer, param.linha)
                }
                promises.push(promise);
            });
                
            $q.all(promises).then(function (promisesResult) {
                for(var i in promisesResult) {
                    var customer = vm.lista.find(function (customerRaiz) {
                        return promisesResult[i].customerId == customerRaiz.Id;
                    });
                    for (var y in customer.Phones) {
                        if (customer.Phones[y].Id == promisesResult[i].phoneId) {
                            customer.Phones[y].statusOnCharging = 3;
                        }
                    }
                }
                vm.resquenting = false;
            }, function (promisesResult) {
                for(var i in promisesResult) {
                    var customer = vm.lista.find(function (customerRaiz) {
                        return promisesResult[i].customerId == customerRaiz.Id;
                    });
                    for (var y in customer.Phones) {
                        if (customer.Phones[y].Id == promisesResult[i].phoneId) {
                            showSimpleToast(promisesResult[i].msg);
                            customer.Phones[y].errorMsg = promisesResult[i].msg;
                            if (promisesResult[i].block) {
                                customer.Phones[y].statusOnCharging = 4;
                            } else {
                                delete customer.Phones[y].statusOnCharging;
                            }
                        }
                    }
                }
                vm.resquenting = false;
            }).catch(function (promisesResult) {
                for(var i in promisesResult) {
                    var customer = vm.lista.find(function (customerRaiz) {
                        return promisesResult[i].customerId == customerRaiz.Id;
                    });
                    for (var y in customer.Phones) {
                        customer.Phones[y].statusOnCharging = 4;
                        console.log(promisesResult[i]);
                        showSimpleToast(promisesResult[i]);
                    }
                }
                vm.resquenting = false;
            });
        }
    }
})();