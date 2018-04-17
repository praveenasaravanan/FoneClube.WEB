(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FoneclubeService', FoneclubeService);

    FoneclubeService.inject = ['$q','HTTPService'];
    function FoneclubeService($q,HTTPService) {

        // var urlApi = 'http://localhost:57078/api';

        //API HOMOL TEMP
        var urlApi = 'http://homol-api.p2badpmtjj.us-east-2.elasticbeanstalk.com/api';

        //API QUE VAI SER PROD
    //   var urlApi = 'http://default-environment.p2badpmtjj.us-east-2.elasticbeanstalk.com/api'

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
        this.postCustomerParent = postCustomerParent;
        this.postUpdatePagarmeID = postUpdatePagarmeID ;
        this.postSendEmail = postSendEmail;
        this.postGeraBoleto = postGeraBoleto
        this.postCustomerComment = postCustomerComment ;
        this.getPlans = getPlans;
        this.getCustomerPlans = getCustomerPlans;
        this.getOperators = getOperators;
        this.getCustomers = getCustomers;
        this.getCustomerByCPF = getCustomerByCPF;
        this.getHistoryPayment = getHistoryPayment;
        this.getCustomerByPhoneNumber = getCustomerByPhoneNumber;
        this.getCustomerById = getCustomerById;
        this.getChargingClients = getChargingClients;
        this.getTblServiceOrders=getTblServiceOrders;
        this.getCustomerParentByPhone=getCustomerParentByPhone;
        this.getAllParents=getAllParents;
        this.getLastPaymentType=getLastPaymentType
        this.getStatusBlockedClaro = getStatusBlockedClaro;
        this.getChargeAndServiceOrderHistory = getChargeAndServiceOrderHistory;
        this.getChargeAndServiceOrderHistoryDinamic = getChargeAndServiceOrderHistoryDinamic;
      this.getStatusCharging = getStatusCharging;
      this.SendEmailStatus = SendEmailStatus;
      
        
        function getLastPaymentType(customer){
            debugger;
            var q=$q.defer();
            HTTPService.get(urlApi.concat('/profile/getpaymentmethod?personID='.concat(customer.Id)))
            .then(function(result){
                debugger;
                q.resolve(result);
            })
            .catch(function(error){
                debugger;
                q.reject(error);
            });

            return q.promise; 
        }
        
        function getCustomerParentByPhone(phoneparent,personid){            
            
            var q=$q.defer();
            HTTPService.get(urlApi.concat('/profile/customer/GetParentbyPhone?phoneparent='+phoneparent+ '&personid='+personid))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise; 
            
        }

        function getAllParents(){
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/profile/customer/GetParentAll'))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function getStatusCharging(month, year){
            var q = $q.defer();
            
            HTTPService.get(urlApi.concat('/charging/cobranca/status/vingencia/mes/' + month + '/ano/' + year))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        function postCustomerComment(commentDetails){
            
            
            var q=$q.defer();
            HTTPService.post(urlApi.concat('/profile/comment'), commentDetails)
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise; 
            
        }
        
        
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


        function postUpdatePagarmeID(customer){
            // customer/pagarme/id/insert
            var q = $q.defer();
            
                        HTTPService.post(urlApi.concat('/profile/customer/pagarme/id/insert'), customer)
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

        function postCustomerParent(param) {
            var q = $q.defer();
            HTTPService.post(urlApi.concat('/profile/customer/parent/insert'), param)
            .then(function(data){
                q.resolve(data);
            })
            .catch(function(error){
                q.reject(error);
            });
            return q.promise;
        }

        function postSendEmail(param) {
            var q = $q.defer();
            HTTPService.post(urlApi.concat('/email/send'), param)
            .then(function(data){
                q.resolve(data);
            })
            .catch(function(error){
                q.reject(error);
            });
            return q.promise;
        }

        function postGeraBoleto(){
            var q = $q.defer();
            HTTPService.post(urlApi.concat('/pagarme/boleto'), param)
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

        function getStatusBlockedClaro(ddd,numeroLinha){
            
            var q = $q.defer();

            HTTPService.get(urlApi.concat('/manager/phones/claro/status/linha/ddd/'+ ddd + '/numeroLinha/'+numeroLinha))
            .then(function(result){
                q.resolve(result);
            })
            .catch(function(error){
                q.reject(error);
            });

            return q.promise;
        }

        // api/manager/phones/claro/status/linha/ddd/{ddd}/numeroLinha/{numeroLinha}

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
        
        function getTblServiceOrders(id)
        {
            var q = $q.defer();
            HTTPService.get(urlApi.concat('/profile/getorders?personID='.concat(id)))
            .then(function(result)
                  {
                q.resolve(result);
            })
            .catch(function(error)
                  {
                q.reject(error);
            });
            return q.promise;
        }

        function getChargeAndServiceOrderHistory(id)
        {
            var q = $q.defer();
            HTTPService.get(urlApi.concat('/profile/getChargeAndServiceOrderHistory?personID='.concat(id)))
            .then(function(result)
                  {
                q.resolve(result);
            })
            .catch(function(error)
                  {
                q.reject(error);
            });
            return q.promise;
        }

        function getChargeAndServiceOrderHistoryDinamic(id,index)
        {
            var q = $q.defer();
            HTTPService.get(urlApi.concat('/profile/getChargeAndServiceOrderHistory?personID='.concat(id)))
            .then(function(result)
            {
                result.indexLista = index
                q.resolve(result);
            })
            .catch(function(error)
                  {
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


      function SendEmailStatus(emaildetails) {
        var q = $q.defer();
        HTTPService.post(urlApi.concat('/email/sendemailstatus/emaildetails'), emaildetails)
          .then(function (result) {
            q.resolve(result);
          })
          .catch(function (error) {
            q.reject(error);
          });

        return q.promise;
      }

    }
})();
