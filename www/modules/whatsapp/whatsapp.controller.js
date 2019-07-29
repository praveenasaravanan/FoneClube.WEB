(function() {
    'use strict';
  
    angular.module('foneClub').controller('WhatsappController', WhatsappController);
  
    WhatsappController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService', '$filter'];
  
    function WhatsappController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService, $filter) {
      var vm = this;
      // debugger;
	  vm.send=send;
      
      
      var customer = ViewModelUtilsService.modalData;
  debugger;
      vm.customer = customer;
	  vm.name=vm.customer.Name;
	  vm.text='';
  
      function send() {
        // debugger;
         var data={
			 ClientId:vm.customer.WClient.ClientId,
			 Text:vm.text
		 };
        FoneclubeService.postSendWhatsappMessage(data).then(function(result) {
          // debugger;
          console.log(result);
          if (result) {
            DialogFactory.showAlertDialog({ message: 'Inserido com sucesso' });
          } else {
            DialogFactory.showAlertDialog({ message: 'Inserido falhou' });
          }
        }); /* 
              .catch(function(error){
                  console.log('catch error');
                  console.log(error);
              }); */
      }
    }
  })();
  