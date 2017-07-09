(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('OrdemServico', OrdemServico);

    OrdemServico.inject = ['$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils', '$stateParams', 'FlowManagerService'];
    function OrdemServico($ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils, $stateParams, FlowManagerService) {
        var vm = this;
        vm.onTapSendOS = onTapSendOS;
        
        init();
        
        function init() {
            vm.data = {
                warn: true,
                text: ''
            }    
        }
        
        function onTapSendOS() {
            console.log('doPush!');
        }
    }
})();