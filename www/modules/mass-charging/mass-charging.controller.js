(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('MassChargingController', MassChargingController);

    MassChargingController.inject = ['$scope', 'FoneclubeService', 'PagarmeService', '$q', 'UtilsService', '$timeout'];

    function MassChargingController($scope, FoneclubeService, PagarmeService, $q, UtilsService, $timeout) {
        var vm = this;
        vm.searchMassCharging = searchMassCharging
        vm.viewName = "Cobrança em massa";
        vm.doMassCharge = doMassCharge;
        //vm.loading = true;

        vm.checkedAll = false;
        vm.checkAllCustomers = checkAllCustomers;
        vm.hasOneChecked = hasOneChecked;

        vm.chargeCustomer = chargeCustomer;
        vm.plans = [];
        vm.year = new Date().getFullYear();
        vm.month = new Date().getMonth() + 1;

        init();
        function init() {
            vm.loading = true;
            vm.paymentMethod = [
                { id:'boletoBS', description: 'Boleto BS' },
                { id:'boletoPG', description: 'Boleto PG' },
                { id:'cartao', description: 'Cartão de Crédito' }
            ]
            // FoneclubeService.getPlans().then(function(result){
            //     console.log(result);
            //     vm.plans = result;
            // });
            FoneclubeService.getChargingClients({month: vm.month, year: vm.year}).then(function(result) {
                // for (var i in result) {
                //     result[i].Ammount = 0;
                //     for (var x in result[i].Phones) {
                //         result[i].Ammount = parseFloat(result[i].Phones[x].Ammount) + parseFloat(result[i].Ammount);
                //     }
                // }
                console.log(result);
                vm.lista = result;
                vm.loading = false;
            }).catch(function (error) {
                vm.lista = [];
                vm.loading = false;
                console.log(error);
            });
        }

        function searchMassCharging() {
            init()
        }

        function chargeCustomer(customer) {

            //Realizar Cobrança;
            if (!customer.statusOnCharging) {
                customer.statusOnCharging = 1;
                return;
            }

            //Confirmar Cobrança;
            if (customer.statusOnCharging == 1) {
                if (!validationsCustomer(customer)) {
                    delete customer.statusOnCharging;
                    return;
                }
                if (!validateOperation(customer)) {
                    delete customer.statusOnCharging;
                    return;
                }
                customer.statusOnCharging = 2;
                processCharging(customer);
                return;
            }

            //Envia mensagem de Erro;
            if (customer.statusOnCharging == 4) {
                showSimpleToast(customer.errorMsg);
            }
        }

        function processCharging(customer) {
            if (customer.typeCharging == 'boletoBS') {
                chargeBoletoBS(customer).then(function (result) {
                    if (result.result == 'sucesso') {
                        customer.statusOnCharging = 3;
                    } else {
                        customer.statusOnCharging = 4;
                        customer.checked = false;
                        customer.errorMsg = error;
                        showSimpleToast(error);
                    }
                }).catch(function (error) {
                    customer.statusOnCharging = 4;
                    customer.checked = false;
                    customer.errorMsg = error;
                    showSimpleToast(error);
                })
            } else if (customer.typeCharging == 'boletoPG') {
                if (!customer.IdPagarme) {
                    showSimpleToast('Não há conta pagar-me para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
                    delete customer.statusOnCharging;
                    return;
                }
                chargeBoletoPG(customer).then(function (result) {
                    if (result.result == 'sucesso') {
                        customer.statusOnCharging = 3;
                    } else {
                        showSimpleToast(reject.msg);
                        customer.errorMsg = reject.msg;
                        customer.checked = false;
                        if (reject.block) {
                            customer.statusOnCharging = 4;
                        } else {
                            delete customer.statusOnCharging;
                        }
                    }
                }).catch(function (error) {
                    customer.statusOnCharging = 4;
                    customer.checked = false;
                    showSimpleToast(error);
                });
            } else if (customer.typeCharging == 'cartao') {
                if (!customer.IdPagarme) {
                    showSimpleToast('Não há conta pagar-me para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber);
                    delete customer.statusOnCharging;
                    return;
                }
                chargeCreditCart(customer).then(function (result) {
                    if (result.result == 'sucesso') {
                        customer.statusOnCharging = 3;
                    } else {
                        showSimpleToast(reject.msg);
                        customer.errorMsg = reject.msg;
                        customer.checked = false;
                        if (reject.block) {
                            customer.statusOnCharging = 4;
                        } else {
                            delete customer.statusOnCharging;
                        }
                    }
                }).catch(function (error) {
                    customer.statusOnCharging = 4;
                    customer.checked = false;
                    showSimpleToast(error);
                });
            }
        }

        function getAPIParansClient(customer, PaymentType) {
            return {
                "ClientId" : customer.Id,
                "Ammount": customer.Charging.Ammount.replace('.', ''),
                "Comment": customer.commentBoleto || '',
                "ChargingComment": customer.Charging.ChargingComment || '',
                "PaymentType": PaymentType
            }
        }
        

        function chargeBoletoBS(customer) {
            var defer = $q.defer();
            var param = getAPIParansClient(customer, 3);
            FoneclubeService.postChargingClient(vm.year, vm.month, param).then(function (result) {
                defer.resolve({result: 'sucesso', customerId: customer.Id});
            }).catch(function (error) {
                defer.resolve({result: 'fail', errorMsg: error.data.Message, customerId: customer.Id});
            });
            return defer.promise; 
        }

        function chargeBoletoPG(customer) {
            var defer = $q.defer();
            var foneclubeCustomer = getAPIParansClient(customer, 2);
            var pagarmeCustomer = {
                'name' : customer.Name,
                'document_number' : customer.DocumentNumber,
                'email' : customer.Email,
                'address' : getAddress(customer),
                'phone' : getContactPhone(customer)
            }
            var instructions = 'FoneClub - 2017'

            FoneclubeService.postChargingClient(vm.year, vm.month, foneclubeCustomer).then(function (result) {
                customer.transactionId = result;
                PagarmeService.postBoleto(foneclubeCustomer.Ammount, instructions, pagarmeCustomer).then(function(result) {
                    PagarmeService.postCaptureTransaction(result.token, foneclubeCustomer.Ammount).then(function(resultCapture) {
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
                            'PaymentStatus': foneclubeCustomer.PaymentType,
                            'TransactionComment': "OK",
                            'BoletoId': resultCapture.id,
                            'AcquireId': resultCapture.acquirer_id
                        }
                        FoneclubeService.postChargingClientCommitCard(vm.year, vm.month, customer.transactionId, confirmCharge).then(function (result) {
                            console.log(result);
                            defer.resolve({result: 'sucesso', customerId: customer.Id});
                        }).catch(function (error) {
                            defer.resolve({result: 'sucesso', customerId: customer.Id});
                            console.log(error);
                            console.log("Houve erro mas a cobrança foi realizada");//Falar com Cardozo;
                        });
                    }).catch(function(error) {
                        defer.resolve({result: 'fail', block: true , msg: 'Erro na captura da transação ' + error.status, customerId: customer.Id});
                    });
                }, function (error) {
                    defer.resolve({result: 'fail', block: true , msg: 'Erro ao realizar transação, Cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber + 'Msg Pagarme: ' + error.data.errors[0].message, customerId: customer.Id});
                }).catch(function (error) {
                    defer.resolve({result: 'fail', block: true , msg: 'Erro ao realizar transação, Cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber + 'Msg Pagarme: ' + error.data.errors[0].message, customerId: customer.Id});
                });
            }).catch(function() {
                defer.resolve({result: 'fail', block: true , msg: error, customerId: customer.Id});
            });
            return defer.promise;
        }

        function chargeCreditCart(customer) {
            var defer = $q.defer();
            var foneclubeCustomer = getAPIParansClient(customer, 1);
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
                    defer.resolve({result: 'fail', block: true, msg:'Não há cartão de crédito cadastrado para o cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber, customerId: customer.Id});
                } else {
                    card = result[0];
                    FoneclubeService.postChargingClient(vm.year, vm.month, foneclubeCustomer).then(function (result) {
                        console.log(result);
                        customer.transactionId = result;
                        PagarmeService.postTransactionExistentCard(foneclubeCustomer.Ammount, card.id, pagarmeCustomer).then(function(result) {
                            PagarmeService.postCaptureTransaction(result.token, foneclubeCustomer.Ammount).then(function(result) {
                                //saveHistoryPayment();
                                var confirmCharge = {
                                    'ClientId': customer.Id,
                                    'PaymentStatus': 2,
                                    'TransactionComment': "OK"
                                }
                                FoneclubeService.postChargingClientCommitCard(vm.year, vm.month, customer.transactionId, confirmCharge).then(function (result) {
                                    console.log(result);
                                    defer.resolve({result: 'sucesso', customerId: customer.Id});
                                }).catch(function (error) {
                                    defer.resolve({result: 'sucesso', customerId: customer.Id});
                                    console.log(error);
                                    console.log("Houve erro mas a cobrança foi realizada");//Falar com Cardozo;
                                });
                            }).catch(function(error){
                                try{
                                    defer.resolve({result: 'fail', block: true , msg: 'Erro na captura da transação' + error.status, customerId: customer.Id});
                                } catch(erro) {
                                    defer.resolve({result: 'fail', block: true , msg: 'Erro na captura da transação', customerId: customer.Id});
                                }
                            });
                        }).catch(function (error) {
                            defer.resolve({result: 'fail', block: true , msg: 'Erro ao realizar transação, Cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber + 'Msg Pagarme: ' + error.data.errors[0].message, customerId: customer.Id});
                        });
                    }).catch(function (error) {
                        defer.resolve({result: 'fail', block: true , msg: error, customerId: customer.Id});
                    });
                }
            }).catch(function(error){
                defer.resolve({result: 'fail', block: false, msg:'falha ao recuperar cartão do cliente: ' + customer.Name + ", CPF: " + customer.DocumentNumber, customerId: customer.Id});
            });
            return defer.promise;
        }

        // Utils =====================================================================================================
        function validationsCustomer(customer) {
            if (!getAddress(customer) || !getContactPhone(customer)) {
                return false;
            }
            if (!customer.Email) {
                showSimpleToast("O Cliente: " + customer.Name +", deve ter cadastrado o E-mail.");
                return false;
            }
            return true;
        }
        function validateOperation(customer) {
            if (!customer.typeCharging || customer.typeCharging.length == 0) {
                showSimpleToast("Selecione uma forma de pagamento para o cliente: " + customer.Name + ".");
                return false;
            }
            if (customer.typeCharging != 'cartao' && !customer.commentBoleto && customer.commentBoleto.length == 0) {
                showSimpleToast("Para cobranças por boleto é necessário informar o 'Comentário Boleto'.");
                return false;
            }
            if (!customer.Charging.Ammount || customer.Charging.Ammount == 0) {
                showSimpleToast("Obrigátio informar a quantia para cobrança. Cliente: " + customer.Name + ".");
                return false;
            }
            return true;
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
        function getOperator(id) {
            return vm.plans.find(function (element) {
                return element.id == id;
            });
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






































        // OLD



        // function validationPhone(phone) {
        //     if (!phone.typeCharging) {
        //         showSimpleToast("É obrigatório informar o tipo de cobrança. Linha: " + phone.NickName);
        //         return false;
        //     } else if ((phone.typeCharging == 'boletoBS' || phone.typeCharging == 'boletoPG') && (!phone.commentBoleto || phone.commentBoleto.length == 0 )) {
        //         showSimpleToast("É obrigatório informar comentário para cobrança por boleto. Linha: " + phone.NickName);
        //         return false;
        //     } else if (!phone.Chargings[0].Ammount) {
        //         showSimpleToast("É obrigatório informar a quantia para cobrança. Linha: " + phone.NickName);
        //         return false;
        //     }
        //     return true;
        // }













        




        //326405 pagarme
        //postChargingClientCommitCard

        // 1 = confirmação;
        // 2 = processando;
        // 3 = sucesso;
        // 4 = erro;

        function checkAllCustomers() {
            vm.checkedAll = !vm.checkedAll;
            for (var i in vm.lista) {
                if (!vm.lista[i].statusOnCharging && !vm.lista[i].Charging.Charged) {
                    vm.lista[i].checked = vm.checkedAll;
                }
            }
        }

        function hasOneChecked() {
            for (var x in vm.lista) {
                if (vm.lista[x].checked) {
                    return true;
                    break
                }
            }
            return false;
        }

        function doMassCharge() {
            vm.resquenting = true;
            var lista = angular.copy(vm.lista)

            var toChargeList = lista.filter(function (element) {
                return element.checked == true && element.Charging.Charged != true;
            });

            if (toChargeList.length == 0) {
                showSimpleToast("Selecione ao menos uma linha.");
                vm.resquenting = false;
                return;
            }

            for (var i in toChargeList) {
                if (!validationsCustomer(toChargeList[i])) {
                    vm.resquenting = false;
                    return;
                }
            }

            var promises = [];
            angular.forEach(toChargeList , function(customer) {
                var promise = null
                if (customer.typeCharging == 'boletoBS') {
                    promise = chargeBoletoBS(customer);
                } else if (customer.typeCharging == 'boletoPG') {
                    promise = chargeBoletoPG(customer);
                } else if (customer.typeCharging == 'cartao') {
                    promise = chargeCreditCart(customer);
                }
                promises.push(promise);
            });
                
            $q.all(promises).then(function (promisesResult) {
                for(var i in promisesResult) {
                    if (promisesResult[i].result == 'sucesso') {
                        var customer = vm.lista.find(function (customerRaiz) {
                            return promisesResult[i].customerId == customerRaiz.Id;
                        });
                        customer.statusOnCharging = 3;
                        customer.checked = false;
                    } else {
                        var customer = vm.lista.find(function (element) {
                            return promisesResult[i].customerId == element.Id;
                        });
                        customer.errorMsg = promisesResult[i].msg;
                        customer.checked = false;
                        if (promisesResult[i].block) {
                            customer.statusOnCharging = 4;
                        } else {
                            delete customer.statusOnCharging;
                        }
                    }
                }
                vm.resquenting = false;
            }).catch(function (promisesResult) {
                var customer = vm.lista.find(function (element) {
                    return promisesResult.customerId == element.Id;
                });
                customer.errorMsg = promisesResult.msg;
                customer.checked = false;
                if (promisesResult.block) {
                    customer.statusOnCharging = 4;
                } else {
                    delete customer.statusOnCharging;
                }
                vm.resquenting = false;
            });
        }

        // function chargeWholeCustomer(customer, phones) {
        //      if (!customer.statusOnCharging) {
        //         customer.Ammount = getTotalAmmountCustomer(phones);
        //         if (customer.Ammount == 0) {
        //             showSimpleToast('Não há cobranças a serem realizadas para este cliente.');
        //             return;
        //         }
        //         customer.statusOnCharging = 11
        //     } else if (customer.statusOnCharging == 11) {
        //         customer.statusOnCharging = 1
        //     } else if (customer.statusOnCharging == 1) {
        //         customer.statusOnCharging = 2
        //         if (!validationsCustomer(customer)) {
        //             customer.statusOnCharging = 11
        //             return;
        //         }
        //         if (!customer.typeCharging) {
        //             showSimpleToast("É obrigatório informar o tipo de cobrança.");
        //             customer.statusOnCharging = 11
        //             return;
        //         } else if ((customer.typeCharging == 'boletoBS' || customer.typeCharging == 'boletoPG') && (!customer.commentBoleto || customer.commentBoleto.length == 0 )) {
        //             showSimpleToast("É obrigatório informar comentário para cobrança por boleto.");
        //             customer.statusOnCharging = 11
        //             return;
        //         } else if (!customer.Ammount) {
        //             showSimpleToast("É obrigatório informar a quantia para cobrança.");
        //             customer.statusOnCharging = 11
        //             return;
        //         }
        //         if (customer.typeCharging == 'boletoBS') {
        //             chargeBoletoBS(customer, { Chargings: [{Ammount: customer.Ammount}], commentBoleto: customer.commentBoleto}).then(function (result) {
        //                 customer.statusOnCharging = 3;
        //             }).catch(function (error) {
        //                 customer.statusOnCharging = 4;
        //                 customer.errorMsg = error;
        //                 showSimpleToast(error);
        //             })
        //         } else if (customer.typeCharging == 'boletoPG') {
        //             chargeBoletoPG(customer, { Chargings: [{Amount: customer.Ammount}], commentBoleto: customer.commentBoleto}).then(function (result) {
        //                 customer.statusOnCharging = 3;
        //             }, function (reject) {
        //                 showSimpleToast(reject.msg);
        //                 customer.errorMsg = reject.msg;
        //                 if (reject.block) {
        //                     customer.statusOnCharging = 4;
        //                 } else {
        //                     delete customer.statusOnCharging;
        //                 }
        //             }).catch(function (error) {
        //                 customer.statusOnCharging = 4;
        //                 showSimpleToast(error);
        //             });
        //         } else if (customer.typeCharging == 'cartao') {
        //             chargeCreditCart(customer, { Chargings: [{Amount: customer.Ammount}], commentBoleto: customer.commentBoleto}).then(function (result) {
        //                 customer.statusOnCharging = 3;
        //             }, function (reject) {
        //                 showSimpleToast(reject.msg);
        //                 customer.errorMsg = reject.msg;
        //                 if (reject.block) {
        //                     customer.statusOnCharging = 4;
        //                 } else {
        //                     delete customer.statusOnCharging;
        //                 }
        //             }).catch(function (error) {
        //                 customer.statusOnCharging = 4;
        //                 showSimpleToast(error);
        //             });
        //         }
        //      } else if (customer.statusOnCharging == 4) {
        //         showSimpleToast(customer.errorMsg);
        //     }
        // }

        // function getTotalAmmountCustomer(phones) {
        //     var total = 0;
        //     for (var i in phones) {
        //         if (!phones[i].Chargings[0].Charged) {
        //             total = total + phones[i].Chargings[0].Ammount;
        //         }
        //     }
        //     return total;
        // }
    }
})();