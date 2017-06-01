(function() {
'use strict';

    angular
        .module('foneClub')
        .service('LocationService', LocationService);

    LocationService.inject = ['$state'];
    function LocationService($state) {

        this.change = change;

        function change(value, dataParameters) {
            $state.go(value, {
                data: dataParameters
            });
        }
    }
})();