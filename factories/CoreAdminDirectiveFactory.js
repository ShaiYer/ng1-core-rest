/**
 * Not completed
 * On going work!!!!
 */

angular.module("ngCoreRest").factory("CoreAdminDirectiveFactory", CoreAdminDirectiveFactory);

CoreAdminDirectiveFactory.$inject = ['$timeout'];

function CoreAdminDirectiveFactory ($timeout){



    var getInstance = function(vm, options){

        var options = options || {};
        var dynamicController = options.controller || 'PageController';
        

        var directive ={
            link: linkFunc,
            templateUrl: 'views/admin/partials/admin-directive.ng.html',
            restrict: 'A',
            scope: {
                content: '=',
                contentCollection: '=',
                sortable: '=',
                index: '=',
                internalEdit: '@'
            },
            controller: dynamicController,
            controllerAs: 'vm',
            bindToController: true
        };


        /**
         * override directive options
         */

        for(option in options){
            directive[option] = options[option];
        }

        return directive;



        function linkFunc(scope, el, attr, vm){

            scope.$watch('vm.itemUpdatedCounter', function(counter) {
                if(counter > 0){
                    Materialize.toast('Content Updated: ' + vm.content.title, 2500, 'rounded', function(){
                        vm.content.onEdit = false;
                        $timeout(function(){
                            scope.$apply();
                        },1)

                    });

                }
            }, true);
        }
    }

    return {
        getInstance: getInstance
    };
};