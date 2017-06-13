angular.module("ngCoreRest").factory("CoreAutocompleteDirectiveFactory", coreAutocompleteDirectiveFactory);

coreAutocompleteDirectiveFactory.$inject = ['$timeout', '$collection','$http'];

function coreAutocompleteDirectiveFactory ($timeout, $collection,$http){



    var getInstance = function(vm, options){

        var defaultMinimumChars = 2;
        var options = options || {};
        var dynamicController = options.controller || 'PageController';
        var directive = {
            link: linkFunc,
            templateUrl: 'views/partials/autocomplete.ng.html',
            restrict: 'A',
            scope: {
                search: '=',
                autocompleteItemId: '=?',
                autocompleteItem: '=',
                autocompleteItemAttr: '@',
                autocompleteItemAttrModel: '=',
                minimumChars: '@',
                autocompleteItemsArray: '=',
                defaultId: '@',

                /**
                 * Multiple select options
                 */

                multipleSelect: '=',
                autocompleteItems: '='
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

            var loadingDelayActive = false;
            var delayTimeout = 1000;

            var typingDelayTimeout = 500;

            var typingActive = false;

            activateLoadingDelay();


            scope.autocompleteCollection = $collection.getInstance();
            scope.autocompleteCollectionSelected = $collection.getInstance();


            scope.autocomplete = [];

            var minimumChars = scope.vm.minimumChars || defaultMinimumChars;

            //console.log('minimumChars', minimumChars);

            var defaultId = scope.vm.defaultId || 0;

            var multipleSelect = scope.vm.multipleSelect || false;


            //try to take out may cause errors
            //scope.vm.autocompleteItems = autocompleteCollectionSelected.array;




            /**
             * Watch for change in the text
             */

            scope.$watch('vm.search', function(search) {

                if(!search){
                    return;
                }

                search = search.trim();

                console.log('activate watch:', search);
                activateDelayTyping();

                $timeout(function(){
                    if(!typingActive){
                        activateFetchResults(search);
                    }

                },typingDelayTimeout);



            }, true);


            function activateDelayTyping(){
                typingActive = true;
                $timeout(function(){
                    typingActive = false;

                },typingDelayTimeout);
            }

            function fetchResults(){
                activateFetchResults(search);
            }



            function resetForSingleSelection(){
                console.log('vmreset', vm.multipleSelect, vm);
                if(!vm.multipleSelect){
                    if(scope.vm.autocompleteItemsArray) {
                        scope.autocompleteCollectionSelected.removeAll();
                        scope.vm.autocompleteItemsArray = [];
                    }
                    //reset all other inputs
                }
            }


            /**
             * ng-click select item
             * @param item
             * @param checked
             */

            scope.vm.selectItem = function(item, checked, paramToFill){
                bindMouseOut();
                if(checked){

                    /**
                     * activate delay
                     *
                     */
                    scope.vm.autocompleteItem = scope.vm.autocompleteItem || {};


                    /**
                     * handle multipleSelection
                     * @type {*}
                     */

                    resetForSingleSelection();


                    var onEdit = angular.copy(scope.vm.autocompleteItem.onEdit);

                    activateLoadingDelay();

                    var autocompleteParam = item.id;
                    if(paramToFill && item[paramToFill]){
                        autocompleteParam = item[paramToFill];
                    }

                    scope.vm.autocompleteItemId =  autocompleteParam;
                    scope.vm.autocompleteItem = angular.copy(item);


                    //remove other if not multiple
                    if(!multipleSelect){
                        //autocompleteCollectionSelected.removeAll();
                        scope.showAutocomplete = false;
                    } else {
                        scope.showAutocomplete = true;
                        onEdit = true;
                    }

                    console.log('checked');
                    console.log(scope.vm.autocompleteItemAttr );
                    if(scope.vm.autocompleteItemAttr ){
                        scope.vm.autocompleteItemAttrModel = item[scope.vm.autocompleteItemAttr];
                    }

                    if(scope.vm.autocompleteItemsArray){
                        scope.vm.autocompleteItemsArray.push(item);

                        console.log('scope.vm.autocompleteItem',scope.vm.autocompleteItem);
                        console.log('scope.vm.autocompleteItemsArray',scope.vm.autocompleteItemsArray);
                        //scope.vm.autocompleteItem = {};
                        scope.vm.autocompleteItem.deleted = true;
                        onEdit = true;

                    } else {

                        //onEdit = scope.vm.multiple;

                    }
                    scope.vm.autocompleteItem.onEdit = onEdit;

                    /**
                     * Hides the box by the template ng-show argument
                     */
                    //scope.autocompleteCollection.removeAll();

                    scope.autocompleteCollectionSelected.add(item);
                } else {
                    scope.vm.autocompleteItemId = defaultId;
                    scope.vm.autocompleteItem = {};
                    scope.autocompleteCollectionSelected.remove(item);
                }
            }

            /**
             *
             * @param search
             */

            function activateFetchResults(search){
                if(search && !typingActive && !loadingDelayActive && search.length >= minimumChars){
                    fetchAutocompleteResults(search);
                }
                activateLoadingDelay();
            }

            function fetchAutocompleteResults(search){

                scope.showAutocomplete = true;

                if(scope.loadingDelayActive || vm.loading || !search || search.length < minimumChars){
                    return;
                }
                console.log('start refresh');
                if(options.url){
                    vm.loading = true;
                    $http({
                        method: 'GET',
                        url: options.url,
                        cache: true,
                        params: {search: search}

                    }).then(function successCallback(response) {
                        scope.autocompleteCollection.removeAll();
                        scope.autocompleteCollection.addAll(response.data);
                        vm.loading = false;
                    }, function errorCallback(response) {
                        console.log('etrrror', response)
                        vm.loading = false;
                    });

                }

                if(!options.url){
                    vm.refresh({
                        search:search,
                        collection: scope.autocompleteCollection,
                        cache: true
                    });
                }


            }

            /**
             * is item selected
             * @param item
             * @returns {boolean}
             */


            scope.isChecked = function(item){

                var isChecked = false;
                if(scope.autocompleteCollectionSelected.get(item.id)){
                    isChecked = true;
                }
                return isChecked;
            }




            /**
             * Activate loading delay to avoid multiple ajax calls
             * @param seconds
             */

            function activateLoadingDelay(seconds){
                var delayTimeoutLocal = seconds || delayTimeout;

                loadingDelayActive = true;

                $timeout(function(){
                    loadingDelayActive = false;
                }, delayTimeoutLocal);

            }


            //empty list to hide the autocomplete
            function bindMouseOut(){
                el.bind('mouseout', function (e) {
                    console.log('mouseout');
                    /**
                     * Empty list
                     */
                    if(!multipleSelect){
                        //autocompleteCollectionSelected.removeAll();
                        scope.showAutocomplete = false;
                    }else {
                        scope.showAutocomplete = true;
                    }
                    //scope.autocompleteCollection.removeAll();
                    scope.$apply();
                    el.unbind('mouseout');
                });
            }

        }
    }

    return {

        getInstance: getInstance
    };
};