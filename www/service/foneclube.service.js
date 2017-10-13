(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FoneclubeService', FoneclubeService);

    FoneclubeService.inject = ['$q','HTTPService'];
    function FoneclubeService($q,HTTPService) {

<<<<<<< HEAD
        // var urlApi = 'http://localhost:57078/api';
=======
        //var urlApi = 'http://localhost:57078/api';
>>>>>>> featuresMassCharging

        //API HOMOL TEMP
        var urlApi = 'http://homol-api.p2badpmtjj.us-east-2.elasticbeanstalk.com/api';

        //API QUE VAI SER PROD
        //var urlApi = 'http://default-environment.p2badpmtjj.us-east-2.elasticbeanstalk.com/api';

        this.postBasePerson = postBasePerson;
        this.postUpdatePerson = postUpdatePerson;
        this.postUpdatePersonAdress = postUpdatePersonAdress;
        this.postCheckout = postCheckout;
        this.postHistoryPayment = postHistoryPayment;
        this.postDeletePerson = postDeletePerson;
        this.postUpdateCustomer = postUpdateCustomer;
        this.postOrderServicePerson = postOrderServicePerson;
        this.postChargingClient = postChargingClient;
        this.postChargingClientCommitCard = postChargingClientCommitCard;
        this.getPlans = getPlans;
        this.getCustomerPlans = getCustomerPlans;
        this.getOperators = getOperators;
        this.getCustomers = getCustomers;
        this.getCustomerByCPF = getCustomerByCPF;
        this.getHistoryPayment = getHistoryPayment;
        this.getCustomerByPhoneNumber = getCustomerByPhoneNumber;
        this.getCustomerById = getCustomerById;
        this.getChargingClients = getChargingClients;
        
        function postUpdatePerson(personCheckout){
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/update'), personCheckout)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function postDeletePerson(personCheckout){
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/delete/customer'), personCheckout)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function postUpdatePersonAdress(personCheckout){
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/updateAdress'), personCheckout)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function postBasePerson(personCheckout){
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/insert'), personCheckout)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function postCheckout(personCheckout){
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/cadastro'), personCheckout)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function postHistoryPayment(personCharging){
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/charging/insert'), personCharging)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }
        
        function postUpdateCustomer(customer){
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/customer/update'), customer)
            .then(function(data){
                q.resolve(data);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }
        
        function postOrderServicePerson(param) {
            var q = $q.defer();

            HTTPService.post(urlApi.concat('/profile/service/order'), param)
            .then(function(data){
                q.resolve(data);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function postChargingClient(year, month, param) {
            var q = $q.defer();
            HTTPService.post(urlApi.concat('/charging/').concat(year).concat('/').concat(month).concat('/clients/').concat(param.ClientId).concat('/charging'), param)
            .then(function(data){
                q.resolve(data);
            })
            .catch(function(error){
                q.reject(error);
            });
            return q.promise;
        }

        function postChargingClientCommitCard(year, month, chargingId, param) {
            var q = $q.defer();
            HTTPService.post(urlApi.concat('/charging/').concat(year).concat('/').concat(month).concat('/clients/').concat(param.ClientId).concat('/charging/').concat(chargingId), param)
            .then(function(data){
                q.resolve(data);
            })
            .catch(function(error){
                q.reject(error);
            });
            return q.promise;
        }

        function getPlans(){
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/account/plans'))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }
        
        function getCustomerPlans(register){
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/profile/customer/plans?documentNumber=').concat(register.toString()))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function getOperators(){
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/account/operators'))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }
        
        function getCustomerByCPF(param){

            var q = $q.defer();

            HTTPService.get(urlApi.concat('/profile/cliente?documentRegister='.concat(param)))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function getCustomers(){

            var q = $q.defer();

            HTTPService.get(urlApi.concat('/profile/customers'))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function getHistoryPayment(id){
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/profile/charges?personID='.concat(id)))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }
        
        function getCustomerByPhoneNumber(param) {
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/profile/phoneOwner'), param)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }
        
        function getCustomerById(id) {
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/profile/cliente/id/'.concat(id)))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function getChargingClients(param){
            var q = $q.defer();
            
            HTTPService.get(urlApi.concat('/charging/').concat(param.year).concat('/').concat(param.month).concat('/clients'))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

    }
})();