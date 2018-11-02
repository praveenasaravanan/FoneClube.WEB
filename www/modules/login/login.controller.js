(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('LoginController', LoginController);

  LoginController.inject = ['FlowManagerService', '$scope', 'FireBaseManagerUtil', 'MainUtils', 'DialogFactory','localStorageService', 'FoneclubeService'];
  function LoginController(FlowManagerService, $scope, FireBaseManagerUtil, MainUtils, DialogFactory, localStorageService, FoneclubeService) {
        var vm = this;
        vm.login = login;

         FoneclubeService.getStatusAPI().then(function(result){
                vm.statusBase = result;
                console.log(result)
            })

        function validaLogin(){

            var users = FireBaseManagerUtil.getUsers();

          
            for(var i in users){
                var user = users[i];
                if(user.user == vm.user && user.password == vm.password)
                {
                    MainUtils.setAgent(user.user);
                    return true;
                }

            }

            return false;
        }

        function login(){
            if(validaLogin())
            {
              localStorageService.add("userid",'True')
              FlowManagerService.changeHomeView();


            }
            else
            {
                DialogFactory.showMessageDialog({mensagem: 'Usuário ou senha incorretos', titulo: 'Alerta'});
            }
        }

    }
})();
