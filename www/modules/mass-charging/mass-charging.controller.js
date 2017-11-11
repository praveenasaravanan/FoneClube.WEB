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
        vm.month = new Date().getMonth() + 1;
        vm.checkedAll = false;
        vm.checkAllCustomers = checkAllCustomers;
        vm.chargeWholeCustomer = chargeWholeCustomer;

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

        function checkAllCustomers() {
            vm.checkedAll = !vm.checkedAll;
            for (var i in vm.lista) {
                for (var y in vm.lista[i].Phones) {
                    if (!vm.lista[i].Phones[y].statusOnCharging && !vm.lista[i].Phones[y].Chargings[0].Charged) {
                        vm.lista[i].Phones[y].checked = vm.checkedAll;
                    }
                }
            }
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
                //delete phone.statusOnCharging;
                return false;
            }
            if (!customer.Email) {
                showSimpleToast("O Cliente: " + customer.Name +", deve ter cadastrado o E-mail.");
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
            if (!validationsCustomer(customer)) {
                delete phone.statusOnCharging;
                return;
            }

            if (phone.typeCharging == 'boletoBS') {
                chargeBoletoBS(customer, phone).then(function (result) {
                    phone.statusOnCharging = 3;
                }).catch(function (error) {
                    phone.statusOnCharging = 4;
                    phone.checked = false;
                    phone.errorMsg = error;
                    showSimpleToast(error);
                })
            } else if (phone.typeCharging == 'boletoPG') {
                if (!customer.IdPagarme) {
                    showSimpleToast('Não há conta pagar-me para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
                    delete phone.statusOnCharging;
                    return;
                }
                chargeBoletoPG(customer, phone).then(function (result) {
                    phone.statusOnCharging = 3;
                }, function (reject) {
                    showSimpleToast(reject.msg);
                    phone.errorMsg = reject.msg;
                    phone.checked = false;
                    if (reject.block) {
                        phone.statusOnCharging = 4;
                    } else {
                        delete phone.statusOnCharging;
                    }
                }).catch(function (error) {
                    phone.statusOnCharging = 4;
                    phone.checked = false;
                    showSimpleToast(error);
                });
            } else if (phone.typeCharging == 'cartao') {
                if (!customer.IdPagarme) {
                    showSimpleToast('Não há conta pagar-me para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
                    delete phone.statusOnCharging;
                    return;
                }
                chargeCreditCart(customer, phone).then(function (result) {
                    phone.statusOnCharging = 3;
                }, function (reject) {
                    showSimpleToast(reject.msg);
                    phone.errorMsg = reject.msg;
                    if (reject.block) {
                        phone.statusOnCharging = 4;
                        phone.checked = false;
                    } else {
                        delete phone.statusOnCharging;
                    }
                }).catch(function (error) {
                    phone.statusOnCharging = 4;
                    phone.checked = false;
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
                defer.reject({errorMsg: error.data.Message, customerId: customer.Id, phoneId: phone.Id});
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
                        defer.reject({block: true , msg: 'Erro na captura da transação ' + error.status, customerId: customer.Id, phoneId: phone.Id});
                    });
                }, function (error) {
                    defer.reject({block: true , msg: 'Erro ao realizar transação, verifique os dados do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber, customerId: customer.Id, phoneId: phone.Id});
                }).catch(function (error) {
                    defer.reject({block: true , msg: 'Erro ao realizar transação, verifique os dados do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber, customerId: customer.Id, phoneId: phone.Id});
                });
            }).catch(function() {
                defer.reject({block: true , msg: error, customerId: customer.Id, phoneId: phone.Id});
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
            PagarmeService.getCard(customer.IdPagarme).then(function(result) {
                if (result.length == 0) {
                    defer.reject({block: true, msg:'Não há cartão de crédito cadastrado para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber, customerId: customer.Id, phoneId: phone.Id});
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
                                    defer.reject({block: true , msg: 'Erro na captura da transação' + error.status, customerId: customer.Id, phoneId: phone.Id});
                                } catch(erro) {
                                    defer.reject({block: true , msg: 'Erro na captura da transação', customerId: customer.Id, phoneId: phone.Id});
                                }
                            });
                        }).catch(function (error) {
                            defer.reject({block: true , msg: 'Erro ao realizar transação, verifique os dados do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber, customerId: customer.Id, phoneId: phone.Id});
                        });
                    }).catch(function (error) {
                        defer.reject({block: true , msg: error, customerId: customer.Id, phoneId: phone.Id});
                    });
                }
            }).catch(function(error){
                defer.reject({block: false, msg:'falha ao recuperar cartão do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber, customerId: customer.Id, phoneId: phone.Id});
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
            }, 3000);
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
                    return element.checked == true && element.Charging != true;
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
                            customer.Phones[y].checked = false;
                        }
                    }
                }
                vm.resquenting = false;
            }, function (promisesResult) {
                var customer = vm.lista.find(function (element) {
                    return promisesResult.customerId == element.Id;
                });

                var phone = customer.Phones.find(function (element) {
                    return element.Id == promisesResult.phoneId;
                });

                phone.errorMsg = promisesResult.msg;
                phone.checked = false;
                if (promisesResult.block) {
                    phone.statusOnCharging = 4;
                } else {
                    delete phone.statusOnCharging;
                }
                vm.resquenting = false;
            }).catch(function (promisesResult) {
                var customer = vm.lista.find(function (element) {
                    return promisesResult.customerId == element.Id;
                });

                var phone = customer.Phones.find(function (element) {
                    return element.Id == promisesResult.phoneId;
                });

                phone.errorMsg = promisesResult.msg;
                phone.checked = false;
                if (promisesResult.block) {
                    phone.statusOnCharging = 4;
                } else {
                    delete phone.statusOnCharging;
                }
                vm.resquenting = false;
            });
        }

        function chargeWholeCustomer(customer, phones) {
             if (!customer.statusOnCharging) {
                customer.Ammount = getTotalAmmountCustomer(phones);
                if (customer.Ammount == 0) {
                    showSimpleToast('Não há cobranças a serem realizadas para este cliente.');
                    return;
                }
                customer.statusOnCharging = 11
            } else if (customer.statusOnCharging == 11) {
                customer.statusOnCharging = 1
            } else if (customer.statusOnCharging == 1) {
                customer.statusOnCharging = 2
                if (!validationsCustomer(customer)) {
                    customer.statusOnCharging = 11
                    return;
                }
                if (!customer.typeCharging) {
                    showSimpleToast("É obrigatório informar o tipo de cobrança.");
                    customer.statusOnCharging = 11
                    return;
                } else if ((customer.typeCharging == 'boletoBS' || customer.typeCharging == 'boletoPG') && (!customer.commentBoleto || customer.commentBoleto.length == 0 )) {
                    showSimpleToast("É obrigatório informar comentário para cobrança por boleto.");
                    customer.statusOnCharging = 11
                    return;
                } else if (!customer.Ammount) {
                    showSimpleToast("É obrigatório informar a quantia para cobrança.");
                    customer.statusOnCharging = 11
                    return;
                }
                if (customer.typeCharging == 'boletoBS') {
                    chargeBoletoBS(customer, { Chargings: [{Ammount: customer.Ammount}], commentBoleto: customer.commentBoleto}).then(function (result) {
                        customer.statusOnCharging = 3;
                    }).catch(function (error) {
                        customer.statusOnCharging = 4;
                        customer.errorMsg = error;
                        showSimpleToast(error);
                    })
                } else if (customer.typeCharging == 'boletoPG') {
                    chargeBoletoPG(customer, { Chargings: [{Amount: customer.Ammount}], commentBoleto: customer.commentBoleto}).then(function (result) {
                        customer.statusOnCharging = 3;
                    }, function (reject) {
                        showSimpleToast(reject.msg);
                        customer.errorMsg = reject.msg;
                        if (reject.block) {
                            customer.statusOnCharging = 4;
                        } else {
                            delete customer.statusOnCharging;
                        }
                    }).catch(function (error) {
                        customer.statusOnCharging = 4;
                        showSimpleToast(error);
                    });
                } else if (customer.typeCharging == 'cartao') {
                    chargeCreditCart(customer, { Chargings: [{Amount: customer.Ammount}], commentBoleto: customer.commentBoleto}).then(function (result) {
                        customer.statusOnCharging = 3;
                    }, function (reject) {
                        showSimpleToast(reject.msg);
                        customer.errorMsg = reject.msg;
                        if (reject.block) {
                            customer.statusOnCharging = 4;
                        } else {
                            delete customer.statusOnCharging;
                        }
                    }).catch(function (error) {
                        customer.statusOnCharging = 4;
                        showSimpleToast(error);
                    });
                }
             } else if (customer.statusOnCharging == 4) {
                showSimpleToast(customer.errorMsg);
            }
        }

        function getTotalAmmountCustomer(phones) {
            var total = 0;
            for (var i in phones) {
                if (!phones[i].Chargings[0].Charged) {
                    total = total + phones[i].Chargings[0].Ammount;
                }
            }
            return total;
        }
    }
})();