(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('MasterController', MasterController);

    MasterController.inject = ['FlowManagerService', 'MainUtils'];
    function MasterController(FlowManagerService, MainUtils) {
        var vm = this;
        console.log('--- Master controller --- ' + FlowManagerService);
        //FlowManagerService.changeLoginView();

        ////////
        MainUtils.setAgent('Cardozo');
        FlowManagerService.changeHomeView();
        ////////

    }

})();