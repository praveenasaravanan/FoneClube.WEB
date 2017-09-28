(function() {

    'use strict';

    angular.module('foneClub').service('UtilsService', UtilsService);

    UtilsService.inject = ['$ionicPopup'];

    function UtilsService($ionicPopup) {
        return {
            clearDocumentNumber: _clearDocumentNumber,
            getContactPhoneFromPhones: _getContactPhoneFromPhones,
            getDocumentNumerWithMask: _getDocumentNumerWithMask,
            getPhoneNumberFromStringToJson: _getPhoneNumberFromStringToJson
        }
        
        function _clearDocumentNumber(documentNumber){
            return documentNumber.replace(/[-.]/g, '');
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

        function _getPhoneNumberFromStringToJson(param) {
            var number = {
                DDD: clearPhoneNumber(param).substring(0, 2),
                Number: clearPhoneNumber(param).substring(2)
            }
            return number;
        }

    }
})();