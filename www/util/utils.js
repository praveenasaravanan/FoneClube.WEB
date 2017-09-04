(function() {

    'use strict';

    angular.module('foneClub').service('UtilsService', UtilsService);

    UtilsService.inject = [];

    function UtilsService() {
        return {
            clearDocumentNumber: _clearDocumentNumber
        }
        
        function _clearDocumentNumber(documentNumber){
            return documentNumber.replace(/[-.]/g, '');
        }

    }
})();