(function() {
'use strict';

    angular
        .module('foneClub')
        .service('HubDevService', HubDevService);

    HubDevService.inject = ['$q','HTTPService'];

    function HubDevService($q, HTTPService) {

        //teste
        var apiToken = '753870300989827ABV5504651477.5'

        this.validaCPF = validaCPF;
        this.validaCEP = validaCEP;

        function validaCPF(cpf, datanascimento){

            var q = $q.defer();

            HTTPService.get('https://ws.hubdodesenvolvedor.com.br/cpf/?cpf='.concat(cpf).concat('&data=').concat(datanascimento).concat('&token=').concat(apiToken))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }


        function validaCEP(cep){

            var q = $q.defer();

            HTTPService.get('https://ws.hubdodesenvolvedor.com.br/cep3/?retorno=json&cep='.concat(cep).concat('&token=').concat(apiToken))
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