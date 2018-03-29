(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('EmailDetailController', EmailDetailController);

  EmailDetailController.inject = ['ViewModelUtilsService', 'MainUtils', '$scope','FoneclubeService'];
  function EmailDetailController(ViewModelUtilsService, MainUtils, $scope, FoneclubeService) {
    debugger;
    var vm = this;
    vm.sendemail = sendemail;
    vm.emailstatus = ViewModelUtilsService.modalEmailDetailemailstatus;
    vm.phone = ViewModelUtilsService.modalEmailDetailphone;
    vm.operator = ViewModelUtilsService.modalEmailDetailoperator;
    vm.from = 'marcio.franco@gmail.com';
    vm.bcc = "";

    if (vm.operator == "1") {
      if (vm.emailstatus == "1" || vm.emailstatus == "2") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
        vm.subject = 'Solicitação de bloqueio de linha por perda/roubo';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Emprsa: Freenetcom Soluções em TI EIRELI" +
          " CNPJ: 08.453.543 / 0001 - 76" +
          " Gostaria de solicitar o bloqueio por perda / roubo temporário da(s) seguinte(s) linha(s):" + vm.phone + ""+
        "Caso alguma linha ja esteja suspensa, favor manter a suspensão e nos informar a data que foi efetivada o bloqueio." +
          "At" +
          "Marcio Guiamaraes Franco" +
          "Gestor";
      }
      else if (vm.emailstatus == "4") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
        vm.subject = 'Solicitação de bloqueio voluntario 4 meses (anatel)';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Emprsa: Freenetcom Soluções em TI EIRELI" +
          " CNPJ: 08.453.543 / 0001 - 76" +
          " Gostaria de solicitar o suspensão voluntaria de 4 meses da(s) seguinte(s) linha(s):" + vm.phone + ""+
        " Caso alguma linha ja esteja suspensa, favor manter a suspensão e nos informar a data que foi efetivada o bloqueio." +
          "At" +
          " Marcio Guimarães Franco" +
          " Gestor";
      }

      else if (vm.emailstatus == "3") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
        vm.subject = 'Solicitação de Desbloqueio e ativação de linhas';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Emprsa: Freenetcom Soluções em TI EIRELI" +
          "CNPJ: 08.453.543 / 0001 - 76" +
          "Gostaria de solicitar reversão de qualquer bloqueio ou suspensão e ativação e liberação de usdo de todos os serviços(dados e chamadas) da(s) seguinte(s) linha(s):" +
          vm.phone + " Caso alguma linha ja esteja suspensa, favor manter a suspensão e nos informar a data que foi efetivada o bloqueio." +
          "At" +
          "Marcio Guimarães Franco" +
          "Gestor";
      }

      else if (vm.emailstatus == "5") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
        vm.subject = 'Solicitação de Desbloqueio e ativação de linhas';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Emprsa: Freenetcom Soluções em TI EIRELI" +
          "CNPJ: 08.453.543 / 0001 - 76" +
          "Gostaria de solicitar reversão de qualquer bloqueio ou suspensão e ativação e liberação de usdo de todos os serviços(dados e chamadas) da(s) seguinte(s) linha(s):" +
          vm.phone + " Caso alguma linha ja esteja suspensa, favor manter a suspensão e nos informar a data que foi efetivada o bloqueio." +
          "At" +
          "Marcio Guimarães Franco" +
          "Gestor";
      }

      else if (vm.emailstatus == "6") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
        vm.subject = 'Pedido de alteraços de serviços – Contrato Único';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Segue em anexo Formulário de Pedido (Contrato Unico) com alterações requisitadas." +
          "​Emprsa: Freenetcom Soluções em TI EIRELI"
        "CNPJ: 08.453.543 / 0001 - 76" +

          "Estes pedidos tem em anexo os seguintes documentos para verificação:" +

          "1) Contrato Unico" +
          "2) Ultima alteração contratual da Freenetcom Soluções em TI EIRELI" +
          "3) Formulario de pedido de Contrato Unico" +

          "At" +
          "Marcio Guiamaraes Franco" +
          "Gestor";
      }
      else {
        vm.subject = '';
        vm.cc = '';
        vm.body = '';
        vm.bcc = '';

      }

    }
    else {

      if (vm.emailstatus == "1" || vm.emailstatus == "2") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br'
        vm.subject = 'Solicitação de bloqueio de linha por perda/roubo';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Segue solicitações de alterações e as linhas de referencia para cada pacote:" +
          "Empresa: Freenetcom Soluções em TI EIRELI" +
          "CNPJ: 08.453.543 / 0001 - 76" +
          "Nº do Cliente: 939144068" +
          "Nº da Conta: 100387217" +

          "Mudanças: Bloqueio por perda / roubo das seguintes linha:"

        "At" +
          "Marcio Guiamaraes Franco"
        "Gestor";
      }
      else if (vm.emailstatus == "4") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
        vm.subject = 'Solicitação de bloqueio voluntario 4 meses (anatel)';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Emprsa: Freenetcom Soluções em TI EIRELI"
        "CNPJ: 08.453.543 / 0001 - 76" +
          "Gostaria de solicitar o suspensão voluntaria de 4 meses da(s) seguinte(s) linha(s):" + vm.phone + ""+

        "Caso alguma linha ja esteja suspensa, favor manter a suspensão e nos informar a data que foi efetivada o bloqueio." +
          "At" +
          "Marcio Guimarães Franco" +
          "Gestor";
      }

      else if (vm.emailstatus == "3") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
        vm.subject = 'Solicitação de Desbloqueio e ativação de linhas';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Emprsa: Freenetcom Soluções em TI EIRELI" +
          "CNPJ: 08.453.543 / 0001 - 76" +
          "Gostaria de solicitar reversão de qualquer bloqueio ou suspensão e ativação e liberação de usdo de todos os serviços(dados e chamadas) da(s) seguinte(s) linha(s):" +
          vm.phone + " Caso alguma linha ja esteja suspensa, favor manter a suspensão e nos informar a data que foi efetivada o bloqueio." +
          "At" +
          "Marcio Guimarães Franco" +
          "Gestor";
      }

      else if (vm.emailstatus == "5") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
        vm.subject = 'Solicitação de Desbloqueio e ativação de linhas';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Emprsa: Freenetcom Soluções em TI EIRELI" +
          "CNPJ: 08.453.543 / 0001 - 76" +
          "Gostaria de solicitar reversão de qualquer bloqueio ou suspensão e ativação e liberação de usdo de todos os serviços(dados e chamadas) da(s) seguinte(s) linha(s):" + vm.phone + ""+

        "Caso alguma linha ja esteja suspensa, favor manter a suspensão e nos informar a data que foi efetivada o bloqueio." +
          "At" +
          "Marcio Guimarães Franco" +
          "Gestor";
      }

      else if (vm.emailstatus == "6") {
        vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
        vm.subject = 'Solicitação de troca de planos';
        vm.cc = 'suporte@foneclube.com.br';
        vm.body = "Segue solicitações de alterações e as linhas de referencia para cada pacote:" +
          " Empresa: Freenetcom Soluções em TI EIRELI" +
          " CNPJ: 08.453.543 / 0001 - 76" +
          " Nº do Cliente: 939144068" +
          " Nº da Conta: 100387217" +

          "Mudanças:" +

          " Linha Referencia:" +
          "100mb R$9, 90(21) 96620 9299" +
          "3GB MAX R$34, 90(21) 99339 0000" +
          "6gb - 3GB em Dobro R$49, 90(21) 96409 8283" +
          "10GB - 5GB em Dobro R$64, 60(21) 99103 0000" +
          "20GB - 10gb em Dobro R$74, 90(21) 97555 7325" +

          "At" +
          "Marcio Guimarães Franco" +
          "+Gestor";
      }
      else {
        vm.subject = '';
        vm.cc = '';
        vm.body = '';
        vm.bcc = '';

      }
    }

    function sendemail(vm) {
     
      FoneclubeService.SendEmailStatus(vm).then(function (result) {
        alert('Email sent successfully');
        //debugger;
        //if (result["intIdPaymentType"] == 1) {
        //  debugger;
        //  /*ViewModelUtilsService.showModalRepeatBoleto(result,customer);*/
        //  ViewModelUtilsService.showModalRepeatCard(result, customer);
        //}
        ///*else if(result["intIdPaymentType"]==1){
        //    ViewModelUtilsService.showModalRepeatCard(result,customer);
        //}
        //else if(result["intIdPaymentType"]==3)
        //    {
                
        //    }*/
      })
        .catch(function (error) {
          console.log('catch error');
          console.log(error);
        });
      //FoneclubeService.SendEmailStatus(vm).then(function (result) {
      //  //console.log(result);
        
      //}).catch(function (error) {
      //  console.log('error: ' + error);
      //});
    }



  }
})();
