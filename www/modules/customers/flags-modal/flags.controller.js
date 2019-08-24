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
    vm.showPhones = true;
    vm.changePlan = changePlan;

    if(customer.flagPhone)
      vm.showPhones = false;

    if(customer.selectedPhone != null)
      vm.selectedPhone = customer.selectedPhone.NovoFormatoNumero  

    FoneclubeService.getFlagsTypes(!vm.showPhones).then(function(result){
      vm.flagsTypes = result;
    })

    FoneclubeService.getPlans().then(function(result){
      vm.allPlans = result;
    })

    FoneclubeService.getPersonPhones(customer.Id).then(function(result){
      vm.customerPhones = result;
    })

    function changeSelectedPhone(phone){
      vm.selectedPhone = phone.PersonPhoneId;
    }

    function changeFlag(flag){
      vm.selectedFlag = flag;

      if(vm.selectedFlag.IdType == 1 || vm.selectedFlag.IdType == 2)
        vm.showPlanList = true;
      else
        vm.showPlanList = false;

    }

    function onTapAddComment(data) {

      if(vm.selectedFlag == null)
        alert('Não é possível atribuir flag sem selecionar qual')

      var flag;
      
      debugger;

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

        if(vm.showPlanList){
          flag.PlanId = vm.selectedplan
        }
        
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

    function changePlan(plan){
      vm.selectedplan = plan
    }

  }
})();
