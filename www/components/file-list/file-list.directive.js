(function() {
'use strict';

    angular
        .module('foneClub')
        .directive('file', ['FileListUtil', function(FileListUtil) {
            return {
                restrict: 'AE',
                scope: {
                file: '@'
                },
                link: function(scope, el, attrs){

                    el.bind('change', function(event){
                        var files = event.target.files;
                        var file = files[0];
                        if(file && typeof(file) !== undefined && file.size > 0){
                            scope.file = file;
                            scope.$parent.file = file;
                            FileListUtil.set(file);
                        }
                        else {
                            scope.file = {};
                            scope.$parent.file = {};
                            FileListUtil.set(file);
                        }
                        scope.$apply();
                    });


                }
            };
        }])


})();