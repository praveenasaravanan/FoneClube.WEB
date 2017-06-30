(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('EdicaoController', EdicaoController);

    EdicaoController.inject = ['$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainComponents', 'MainUtils'];
    function EdicaoController($ionicPopup, $ionicModal, $scope, ViewModelUtilsService, FoneclubeService, MainComponents, MainUtils) {
        var vm = this;
       

    }
})();