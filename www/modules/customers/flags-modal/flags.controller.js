(function() {
  'use strict';

  angular.module('foneClub').controller('FlagController', FlagController);

  FlagController.inject = [
    'ViewModelUtilsService',
    'PagarmeService',
    'MainUtils',
    'FoneclubeService',
    'DialogFactory',
    'UtilsService'
  ];

  function FlagController(
    ViewModelUtilsService,
    PagarmeService,
    MainUtils,
    FoneclubeService,
    DialogFactory,
    UtilsService
  ) {

    console.log('--- FlagController ---')
    var vm = this;
    // debugger;
    vm.onTapAddComment = onTapAddComment;
    vm.changeFlag = changeFlag;
    var customer = ViewModelUtilsService.modalCommentData;

    vm.customer = customer;

    FoneclubeService.getFlagsTypes().then(function(result){
      console.log(result)
      vm.flagsTypes = result;
    })

    function changeFlag(flag){
      console.log(`changeFlag`)
      console.log(flag)
    }

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
