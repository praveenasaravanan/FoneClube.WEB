(function() {
    'use strict';
  
    angular.module('foneClub').controller('WhatsappController', WhatsappController);
  
    WhatsappController.inject = [
      'ViewModelUtilsService',
      'PagarmeService',
      'MainUtils',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService'
    ];
  
    function WhatsappController(
      ViewModelUtilsService,
      PagarmeService,
      MainUtils,
      FoneclubeService,
      DialogFactory,
      UtilsService
    ) {
      var vm = this;
      // debugger;
      vm.onTapAddComment = onTapAddComment;
      vm.name="Marcio";
      
      var customer = ViewModelUtilsService.modalCommentData;
  
      vm.customer = customer;
  
      function onTapAddComment(data) {
        // debugger;
        data.intIdPerson = customer.Id;
  
        FoneclubeService.postCustomerComment(data).then(function(result) {
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
  