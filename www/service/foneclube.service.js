(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FoneclubeService', FoneclubeService);

    FoneclubeService.inject = ['$q','HTTPService'];
    function FoneclubeService($q,HTTPService) {

        //var urlApi = 'http://localhost:58949/api';

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
        this.getPlans = getPlans;
        this.getOperators = getOperators;
        this.getCustomers = getCustomers;
        this.getHistoryPayment = getHistoryPayment;

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



    }
})();