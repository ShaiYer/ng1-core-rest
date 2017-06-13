/**
 * Not completed
 * On going work!!!!
 */

angular.module("ngCoreRest").factory("CoreAddAutocompleteDirectiveFactory", coreAddAutocompleteDirectiveFactory);

coreAddAutocompleteDirectiveFactory.$inject = ['$timeout'];

function coreAddAutocompleteDirectiveFactory ($timeout){



    var getInstance = function(vm, options){

        var options = options || {};
        var dynamicController = options.controller || 'PageController';
        var directive = {
            link: linkFunc,
            templateUrl: 'views/partials/add-autocomplete.ng.html',
            restrict: 'A',
            scope: {
                content: '=',
                contentArray: '=',
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

            scope.itemTitle = (options.itemTitle) ? options.itemTitle : 'item';
            scope.multipleSelect = options.multipleSelect;

            scope.addItem = function(title){
                console.log('addItem!');
                if(angular.isArray(vm.contentArray)){

                    var item = angular.copy(options.modelFactory);

                    if(title){
                        item.title = title;
                    }
                    item.onEdit = true;

                    vm.contentArray.push(item);

                    $timeout(function(){
                        scope.$apply();
                    },1);
                }


            }
        }
    }

    return {

        getInstance: getInstance
    };
};