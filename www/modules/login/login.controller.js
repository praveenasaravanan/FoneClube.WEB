(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('LoginController', LoginController);

    LoginController.inject = ['FlowManagerService', '$scope', 'FireBaseManagerUtil', 'MainUtils', 'DialogFactory'];
    function LoginController(FlowManagerService, $scope, FireBaseManagerUtil, MainUtils, DialogFactory) {
        var vm = this;
        vm.login = login;

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
                FlowManagerService.changeHomeView();
            }
            else
            {
                DialogFactory.showMessageDialog({mensagem: 'Usuário ou senha incorretos', titulo: 'Alerta'});                
            }            
        }

    }
})();