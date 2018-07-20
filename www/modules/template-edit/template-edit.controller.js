(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('TemplateEditController', TemplateEditController);
    
      TemplateEditController.inject = ['FlowManagerService'];
      function TemplateEditController(FlowManagerService) {
            var vm = this;
            console.log('-- TemplateEditController --')
            
    
        }
    })();
    