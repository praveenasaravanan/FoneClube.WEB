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
    vm.onTapAddComment = onTapAddComment;
    vm.changeFlag = changeFlag;
    vm.changeSelectedPhone = changeSelectedPhone;

    var customer = ViewModelUtilsService.modalFlagData;
    vm.customer = customer;

    vm.customerPhones = null;
    vm.flagsTypes = null;
    vm.txtDescription = '';


    FoneclubeService.getFlagsTypes().then(function(result){
      console.log(result)
      vm.flagsTypes = result;
    })

    FoneclubeService.getPersonPhones(customer.Id).then(function(result){
      console.log('getPersonPhones')
      console.log(result)
      vm.customerPhones = result;
    })

    function changeSelectedPhone(phone){
      console.log(phone)
      vm.selectedPhone = phone.PersonPhoneId;
    }

    function changeFlag(flag){
      console.log(flag)
      vm.selectedFlag = flag;
    }

    function onTapAddComment(data) {

       debugger;
      if(vm.selectedFlag == null)
        alert('Não é possível atribuir flag sem selecionar qual')

      var flag;

      if(vm.selectedPhone == null){
        flag = {
          'IdFlagType' : vm.selectedFlag.IdType,
          'Description': vm.txtDescription,
          'PendingInteraction': vm.bitPendingInteraction == true,
          'IdPerson': customer.Id
        };
      }
      else{
        flag = {
          'IdFlagType' : vm.selectedFlag.IdType,
          'Description': vm.txtDescription,
          'PendingInteraction': vm.bitPendingInteraction == true,
          'IdPhone': vm.selectedPhone
        };
      }

      
      debugger;

      
      FoneclubeService.postPersonFlag(flag).then(function(result) {
        debugger
        console.log(result);
        if (result) {
          DialogFactory.showAlertDialog({ message: 'Flag inserida com sucesso' });
        } else {
          DialogFactory.showAlertDialog({ message: 'Inserção de flag falhou' });
        }
      }); 

    }

    
    
  }
})();
