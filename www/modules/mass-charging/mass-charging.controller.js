(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('MassChargingController', MassChargingController);

    MassChargingController.inject = ['$scope', 'FoneclubeService', 'PagarmeService', '$q', 'UtilsService'];

    function MassChargingController($scope, FoneclubeService, PagarmeService, $q, UtilsService) {
        var vm = this;
        vm.chargePhoneNumber = chargePhoneNumber;
        vm.viewName = "Cobrança em massa";
        vm.loading = true;

        var mock = {
            year: '2017',
            month: '08'
        }

        init();
        function init() {
            FoneclubeService.getChargingClients(mock).then(function(result) {
                console.log(result);
                vm.lista = result;
                vm.loading = false;
            });
        }

        function validations(phone) {
            if (!phone.typeCharging) {
                return false;
            } else if (phone.typeCharging == 'boleto' && (!phone.commentBoleto || phone.commentBoleto.length == 0 )) {
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
                if (!validations(phone)) {
                    console.log('>> colocar em um toast: >> DADOS DOS CLIENTE/TRANSAÇÃO INCOMPLETOS'); //TODO toast
                    delete phone.statusOnCharging;
                    return;
                }
                phone.statusOnCharging = 2;
                processCharging(customer, phone);
            }
        }

        function processCharging(customer, phone) {
            if (phone.typeCharging == 'boleto') {
                var param = {
                    "ClientId" : customer.Id,
                    "PhoneId" : phone.Id,
                    "Ammount": phone.Chargings[0].Ammount,
                    "Comment": phone.commentBoleto || '',
                    "PaymentType":  2
                }
                FoneclubeService.postChargingClient(mock.year, mock.month, param).then(function (result) {
                    phone.statusOnCharging = 3;
                }).catch(function (error) {
                    console.log(result); //TODO toast
                    phone.statusOnCharging = 4;
                });
            } else {
                chargeCreditCart(customer, phone)
            }
        }

        function chargeCreditCart(customer, phone) {
            if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                delete phone.statusOnCharging;
                return;
            }
            // if (!customer.pagarmeId) {
            //     console.log('Não há conta pagar-me para o cliente: ' + customer.Name);
            //     delete phone.statusOnCharging;
            //     return
            // }
            var card = null;
            PagarmeService.getCard(326405).then(function(result){
                if (result.length == 0) {
                    console.log('Não há cartão de crédito cadastrado para o cliente: ' + customer.Name);
                    delete phone.statusOnCharging;
                } else {
                    card = result[0];
                    debugger;
                    doCreditCardCharge(customer, phone, card).then(function (result) {
                        phone.statusOnCharging = 3;
                    }).catch(function (error) {
                        phone.statusOnCharging = 4;
                        console.log(error);
                    });
                }
            }).catch(function(error){
                console.log('falha ao recuperar cartão do cliente: ' + customer.Name);
                delete phone.statusOnCharging;
            });
        }

        function doCreditCardCharge(customer, phone, card) {
            var defer = $q.defer();
            debugger;
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
            FoneclubeService.postChargingClient(mock.year, mock.month, foneclubeCustomer).then(function (result) {
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
                        FoneclubeService.postChargingClientCommitCard(mock.year, mock.month, phone.transactionId, confirmCharge).then(function (result) {
                            console.log(result);
                            defer.resolve('Cobrança realizada com sucesso;');
                        }).catch(function (error) {
                            defer.reject(error);
                        });
                    }).catch(function(error){
                        try{
                            defer.reject('Erro na captura da transação' + error.status);
                        } catch(erro) {
                            defer.reject('Erro na captura da transação');
                        }
                    });
                }).catch(function (error) {
                    defer.reject('Erro ao realizar transação, verifique os dados do cliente: ' + customer.Name);
                });
            }).catch(function (error) {
                defer.reject(error);
            });       
            return defer.promise;
        }

        function getContactPhone(customer){
            var contacts = UtilsService.getContactPhoneFromPhones(customer.Phones);
            if (!contacts || contacts.length == 0 || contacts[0].DDD == '' || contacts[0].Number == '') {
                console.log('É necessário cadastrar Telefone de Contato para este cliente: ' + customer.Name);
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
                console.log('É necessário cadastrar um Endereço para este cliente: ' + customer.Name);
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

        //326405 pagarme
        //postChargingClientCommitCard

        // 1 = confirmação;
        // 2 = processando;
        // 3 = sucesso;
        // 4 = erro;
    }
})();