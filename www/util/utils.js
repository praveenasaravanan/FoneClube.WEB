(function() {

    'use strict';

    angular.module('foneClub').service('UtilsService', UtilsService);

    UtilsService.inject = ['$ionicPopup'];

    function UtilsService($ionicPopup) {
        return {
            clearDocumentNumber: _clearDocumentNumber,
            showAlert: _showAlert,
            getContactPhoneFromPhones: _getContactPhoneFromPhones,
            getDocumentNumerWithMask: _getDocumentNumerWithMask
        }
        
        function _clearDocumentNumber(documentNumber){
            return documentNumber.replace(/[-.]/g, '');
        }
        
                //ToDo => colocar em uma service, ou utils
        function _showAlert(title, message){
            return $ionicPopup.alert({
                title: title,
                template: message
            });
        }
        
        function _getContactPhoneFromPhones(phones) {
            var contacts = phones.filter(function (element) {
                return !element.IsFoneclube;
            });
            return contacts;
        }
        
        function _getDocumentNumerWithMask(documentNumber) {
            return documentNumber.substr(0, 3) + '.' + documentNumber.substr(3, 3) + '.' + documentNumber.substr(6, 3) + '-' + documentNumber.substr(9)
        }

    }
})();