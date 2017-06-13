/**
 * Angular Core Rest - The Core Rest module for AngularJS
 * @version v0.2.2 - 2015-11-10
 * @author Shai Yerushalmi
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module("ngCoreRest",[]);
angular.module("ngCoreRest").controller("CoreCkeditorController", CoreCkeditorController);

CoreCkeditorController.$inject = [];


function CoreCkeditorController(){


    var vm = this;

    vm.name = "CoreCkeditorController"  ;




}


/**
 * requires refactoring to work better
 */


angular.module("ngCoreRest").directive("contentEditable", contentEditable);

contentEditable.$inject = [];

function contentEditable (){
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            // view -> model
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ctrl.$setViewValue(elm.html());
                });
            });

            // model -> view
            ctrl.render = function(value) {
                elm.html(value);
            };

            // load init value from DOM
            ctrl.$setViewValue(elm.html());

            elm.bind('keydown', function(event) {
                console.log("keydown " + event.which);
                var esc = event.which == 27,
                    el = event.target;

                if (esc) {
                    console.log("esc");
                    ctrl.$setViewValue(elm.html());
                    el.blur();
                    event.preventDefault();
                }

            });

        }
    };

};
/**
 * Directive for for form input
 *
 * Types:
 *
 * default - input
 * textarea
 * textareaQuill
 */

/**
 * In case of error please check the reference:
 * https://github.com/esvit/ng-ckeditor/blob/master/ng-ckeditor.js
 */


angular.module("ngCoreRest").directive("coreCkeditor", coreCkeditor);

coreCkeditor.$inject = ['$timeout', 'MainStatusFactory'];


function coreCkeditor($timeout, MainStatusFactory){

    var directive ={
        link: linkFunc,
        templateUrl: 'views/angularCoreRest/coreCkeditor.ng.html',
        restrict: 'A',
        scope: {
            ngModel: '=',
            fieldTitle: '@',
        },
        controller: 'CoreCkeditorController',
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;


    function linkFunc(scope, el, attr, vm){

        var editorInstance;
        var contentDirection = 'ltr';
        var contentLanguage = 'en';

        if(angular.isDefined(attr.language) && attr.language == 'hebrew'){
            contentDirection = 'rtl';
            contentLanguage = 'he';
        }

        scope.editorName = 'ckeditor' + Math.random();
        scope.init = function(){
            initEditor();
        };


        if(angular.isDefined(attr.initEdit) || vm.ngModel == ""){
            $timeout(function(){
                initEditor();

            },1);
        }

        var configCkeditor = {
            //toolbar: config.toolbar_Full,
            // Define the toolbar groups as it is a more accessible solution.
            title: vm.fieldTitle,
            contentsLangDirection: contentDirection,
            //language_list: [ 'en:English','he:Hebrew:rtl'],
            contentsLanguage: contentLanguage,
            //defaultLanguage: 'he',
            uiColor: '#6099B6',

            // Remove the redundant buttons from toolbar groups defined above.
            removeButtons: 'Flash,Language'
            //removeButtons: 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar'
        };

        console.log('ckedit - cs.config.isAdmin', cs.config.isAdmin);
        if(!MainStatusFactory.isAdmin){
            configCkeditor.toolbar =
            [
                { name: 'basicstyles', items : [ 'Bold','Italic' ] },
                { name: 'links', items : [ 'Link','Unlink' ] },
                // { name: 'document', items : [ 'Source'] },
                { name: 'paragraph', items : [ 'NumberedList','BulletedList' ] },
                { name: 'styles', items : ['Format'] }
            ];


            configCkeditor.format_tags =  'h2;h3;h4';
        } else {
            configCkeditor.toolbarGroups =  [
                {"name":"basicstyles","groups":["basicstyles"]},
                {"name":"links","groups":["links"]},
                {"name":"paragraph","groups":["list","blocks", 'align', 'bidi']},
                {"name":"document","groups":["mode"]},
                {"name":"insert","groups":["insert"]},
                {"name":"styles","groups":["styles"]},
                {"name":"about","groups":["about"]}
            ];
        }

        function initEditor(){
            scope.editActive = true;


            editorInstance = CKEDITOR.replace( scope.editorName, configCkeditor );

            editorInstance.on('change', function() {
                scope.showData();
                $timeout(function(){
                    scope.$apply();
                },1);
            });
        }
        
        
        scope.showData = function(){
            var data = editorInstance.getData();
            vm.ngModel = data;

        }




    }


}


angular.module("ngCoreRest").directive("coreKeepRatio", coreKeepRatio);

coreKeepRatio.$inject = ['$timeout'];


function coreKeepRatio($timeout){

    var directive ={
        link: linkFunc,

        restrict: 'A',
        scope: {
            widthToHeightRatio: "=",
            relativeElementSelector: "="
        },

    };

    return directive;


    function linkFunc(scope, el, attr){

        var resizeTimer;

        var relativeElement = el;
        var ratio = scope.widthToHeightRatio || 1;
        if(scope.relativeElementSelector){
            relativeElement = $(scope.relativeElementSelector);
        }

        var initialized = false;


        $timeout(function(){
            init();
            $( window ).resize(function() {
                resize();
                
            });
        },1);

        $timeout(resize, 2000);

        function init(){
            resize();
            initialized = true;


        }

        function getHeight(){
            var height = relativeElement.width() * ratio;

            return height;
        }



        function resize(){
            var height = getHeight();

            relativeElement.height(height);


        }
    }
}


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
angular.module("ngCoreRest").factory("CoreCollectionFactory", CoreCollectionFactory);

CoreCollectionFactory.$inject = [];
function CoreCollectionFactory (){



    var service = {
        removeByIndex: removeByIndex,
        unsetItem: unsetItem
    };



    return service;


    /**
     * Private functions area
     * @param options
     * @returns {{}}
     * @private
     */



    function removeByIndex(items, index) {
        if(items instanceof Array){
            items.splice(index,1);
        }

        return items;
    }

    function unsetItem(item, items, force){


        if(force === false){
            if(!confirm('Remove?'))
            {
                return;
            }
        }
        if(items instanceof Array){

            var index = items.indexOf(item);
            items.splice(index, 1);
        } else {


            /**
             * if items is a collection then try to remove
             */

            if(typeof items == 'object'){
                try{
                    items.remove(item);
                } catch(e){
                    console.info(e);
                }
            }
        }





    }



};

angular.module("ngCoreRest").factory("CoreHelperFactory", CoreHelperFactory);

CoreHelperFactory.$inject = [];

function CoreHelperFactory (){
    
    
    var service = {
        guid: guid
    };
    
    return service;

    function guid(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    
    
    
}








angular.module("ngCoreRest").factory("CoreLocaleFactory", CoreLocaleFactory);

CoreLocaleFactory.$inject = [];
function CoreLocaleFactory (){



    var service = {
        isStrContainHebrew: isStrContainHebrew
        
    };



    return service;


    /**
     * Private functions area
     * @param options
     * @returns {{}}
     * @private
     */

    var HebrewChars = new RegExp("^[\u0590-\u05FF]+$");
    var AlphaNumericChars = new RegExp("^[a-zA-Z0-9\-]+$");
    var EnglishChars = new RegExp("^[a-zA-Z\-]+$");
    var LegalChars = new RegExp("^[a-zA-Z\-\u0590-\u05FF ]+$");


    function isStrContainHebrew (content){

        isHebrew = false;

        for (var i = 0; i < content.length; i++)
        {

            var charTest = content.charCodeAt(i);
            if ((charTest > 0x590) && (charTest < 0x5FF)){
                console.log("charTest", charTest);
                isHebrew = true;
                break;
            }
        }

        // var isHebrew = HebrewChars.test(content);


        return isHebrew;


    }



};
angular.module("ngCoreRest").factory("CoreRestCtrlFactory", csRestCtrlFactory);

csRestCtrlFactory.$inject = ['$rootScope'];
function csRestCtrlFactory ($rootScope){

    var getInstance = function(vm, restFactory){

        vm.counterPost = 0;
        vm.responseError = false;
        vm.itemUpdatedCounter = 0;
        vm.activeItems = {};
        vm.activeItemId = 0;
        vm.defaultKey = 'defaultKey';
        vm.currentFullResponse = {};

        /**
         * default item to save onEdit
         * Will revert to it on cancel edit
         * @type {{}}
         */
        vm.editOrgItem = {};

        if(restFactory.collection)
        {
            vm.contents = restFactory.collection;
        }

        vm.loading = false;

        /**
         *
         * Callback for create function
         */

        vm.createCallback = restFactory.createCallback || function(){};


        /**
         * Decorate the output from the server following get
         */

        if(restFactory.decorate_ext){
            vm.decorate_ext = restFactory.decorate_ext;
        } else {
            vm.decorate_ext = false;
        }


        /**
         * Decorate the input goes to server before update / save
         */

        if(restFactory.decorateMutator_ext){
            vm.decorateMutator_ext = restFactory.decorateMutator_ext;
        } else {
            vm.decorateMutator_ext = false;
        }


        var _parseQueryOptions = parseQueryOptions;
        /**
         * Functions from the wrapperCtrl
         * @type {boolean}
         */



        vm.refresh = function(options){
            
            vm.currentFullResponse = {};
            var options = options || {};
            var queryParams = _parseQueryOptions(options);

            var rsFn = 'get';
            if(options.cahce)
            {
                rsFn = 'getCache';
            }
            vm.loading = true;
            restFactory.rs[rsFn](queryParams).$promise.then(
                function(success){

                    vm.currentFullResponse = success;
                    success = success.data;

                    var dataDecorated = restFactory.decorateOutputArray(success);

                    
                    csd1.log('success',success);

                    if(options.collection){
                        options.collection.removeAll();
                        options.collection.addAll(dataDecorated);
                    } else {
                        if(restFactory.collection){
                            vm.contents.removeAll();
                            vm.contents.addAll(dataDecorated);
                        }
                    }

                    vm.loading = false;
                },
                function(error){

                    /**
                     * Broadcast error
                     */

                    $rootScope.$broadcast('serverError', {
                        error:error
                    })
                    console.log('error', error);
                    vm.loading = false;
                }
            );
        }


        /**
         * Add new Empty item
         */
        vm.addNew = function(){

            vm.newItem = new restFactory.getModel();
            vm.editItem(vm.newItem);
        }

        vm.addContent = function(item, modelName){
            return restFactory.addContent(item, modelName);

        }


        /**
         * Save Item
         * @param item
         */

        vm.save = function(item){
            if(restFactory.decorateMutator){
                item = restFactory.decorateMutator(item);
            }

            if(item.id){
                update(item);
            } else {
                create(item);
            }
        };


        /**
         * Remove and delete item
         * @param item
         */
        vm.remove = function(item, contentCollection){
            if(!confirm('Remove?'))
            {
                return;
            }

            //if not in db, then just remove from collection;
            if(!item.id){
                restFactory.collection.remove(item);
                return;
            }

            vm.loading = true;
            restFactory.rs.delete({id:item.id}).$promise.then(
                function(response){
                    console.log('success', response);
                    if(!contentCollection){
                        restFactory.collection.remove(item);
                    } else {

                        //remove from array
                        if(contentCollection instanceof Array){
                            for(var i = 0; i < contentCollection.length; i++){
                                console.log(item, contentCollection[i]);
                                if(item.id){
                                    if(item.id == contentCollection[i].id){
                                        contentCollection.splice(i,1);
                                    }
                                }
                                //else {
                                //    if(item.$$hash == contentCollection[i].$$hash){
                                //        contentCollection.splice(i,1);
                                //    }
                                //}

                            }
                        }
                    }

                    vm.loading = false;
                },
                function(error){
                    console.log('error', error);
                    vm.loading = false;
                }
            );
        }

        /**
         * unset item from collection / array without saving.
         * @param item
         * @param items
         */
        vm.unsetItem = unsetItem;


        /**
         * remove by index
         * @type {removeByIndex}
         */
        vm.removeByIndex = removeByIndex;



        /**
         * Create new item
         * @param newItem
         */
        var create = function(newItem){
            if(vm.loading){
                return;
            }
            var newItemCreate = angular.copy(newItem);
            vm.loading = true;
            vm.counterPost += 1;

            restFactory.create(newItemCreate).then(
                function(success){
                    vm.loading = false;
                    vm.itemUpdatedCounter += 1;

                    /**
                     * call back to createCallback if exist with the response
                     */
                    newItem.onEdit = false;
                    if(vm.createCallback){
                        vm.createCallback(success);
                    }

                },
                function(error, headers){
                    vm.responseError = "";
                    console.log('error', error, headers);
                    vm.loading = false;
                    vm.responseError = 'oops....';
                }
            )

        }

        var update = function(editContent){
            if(vm.loading){
                return;
            }

            var editContentOrg = angular.copy(editContent);
            vm.loading = true;
            restFactory.rs.update(editContent).$promise.then(
                function(response){
                    vm.loading = false;
                    var decoratedItem = restFactory.decorateOutputItem(response.data);

                    editContent = decoratedItem;

                    if(vm.contents && decoratedItem.id){
                        if(vm.contents.get(decoratedItem.id)){
                            vm.contents.update(decoratedItem);
                        } else {
                            vm.contents.add(decoratedItem);
                        }
                    }


                    /**
                     * exit edit mode
                     * @type {boolean}
                     */
                    editContent.onEdit = false;
                    vm.resetActiveItem();
                    vm.itemUpdatedCounter += 1;
                    if(!editContentOrg.id){
                        editContent = false;
                    }

                    /**
                     * broadcast success
                     */
                    $rootScope.$broadcast('serverSuccess', {
                        response: response
                    });
                },
                function(error){
                    console.log('error11',error);

                    /**
                     * Broadcast succes
                     */
                    $rootScope.$broadcast('serverError', {
                        error:error
                    });
                    vm.serverError = error;
                    vm.loading = false;
                }
            )
        }

        vm.cancelSave = function(item){

            item.onEdit = false;
            vm.resetActiveItem();

            if(vm.editOrgItem){
                angular.copy(vm.editOrgItem, item);
            }
            item.onEdit = false;

        }
        vm.resetActiveItem = function(){
            vm.setActiveItem({}, null, false);
            vm.activeItemId = 0;
        }
        vm.resetEditOrg = function(){
            vm.editOrgItem = {};

        }

        vm.editItem = function(item){

            item.onEdit = true;
             angular.copy(item, vm.editOrgItem);

            item.opened_for_edit = true;


            vm.setActiveItem(item);
        }

        /**
         * End Edit item without save
         * @param item
         */
        vm.endEditItem = function(item){
            item.onEdit = false;
            vm.resetActiveItem();
        }


        /**
         *
         * @param item
         * @param force
         *
         * Toggle Item from being the active item
         * Can also force it to be active
         */

        function getItemKey(key){
            if(!key){
                key = vm.defaultKey;
            }

            return key;
        }

        vm.setActiveItem = function(item, key, force){

            key = getItemKey(key);

            item = item || {};

            if((this.isActiveItem(item, key) && !force) || force === false){
                this.activeItems[key] = {}
            } else {
                this.activeItems[key] = item;
            }
            vm.activeItemId = item.id || true;

            return this.getActiveItem(key);

        }

        vm.isActiveItem = function(item,key){

            key = getItemKey(key);

            var response = false;
            if(this.activeItems[key]){
                response = (item.id == this.activeItems[key].id);
            }

            return response;
        }

        vm.getActiveItem = function(key){
            key = getItemKey(key);

            var item;
            if(angular.isDefined(this.activeItems[key])){
                item = this.activeItems[key];
            } else {
                item = this.setActiveItem(key);
            }

            return item;
        }
        vm.getActiveItemId = function(key){
            var item = vm.getActiveItem(key);

            var id = false;
            if(item){
                id = item.id;
            }

            return id;
        }





        return vm;

    }

    return {

        getInstance: getInstance
    };


    /**
     * Private functions area
     * @param options
     * @returns {{}}
     * @private
     */


    function parseQueryOptions(options){
        var queryParams = {};
        var options = options || {};

        if(options.queryParams){
            for(param in options.queryParams){
                queryParams[param] = options.queryParams[param];
            }
        }

        if(options.search){
            queryParams.search = options.search;
        }
        return queryParams;
    }

    function removeByIndex(items, index) {
        if(items instanceof Array){
            items.splice(index,1);
        }

        return items;
    }

    function unsetItem(item, items, force){


        if(force === false){
            if(!confirm('Remove?'))
            {
                return;
            }
        }
        if(items instanceof Array){
            for(var i = 0 ; i < items.length; i++){
                if(item.id == items[i].id) {
                    items.splice(i,1);
                }
            }
        }

        /**
         * if items is a collection then try to remove
         */


        if(typeof items == 'object'){
            try{
                items.remove(item);
            } catch(e){
                console.info(e);
            }
        }
    }



};

angular.module("ngCoreRest").factory("CoreRestFactory", CoreRestFactory);

CoreRestFactory.$inject = ['$collection', '$resource', '$http', '$q','$sce', 'CoreHelperFactory'];

function CoreRestFactory ($collection, $resource, $http, $q, $sce, CoreHelperFactory){







    var getInstance = function(options){

        var instance = {};
        
        instance.config = options.config || {};
        
        instance.baseUrl = options.baseUrl;

        instance.url = options.baseUrl;
        instance.addContentSettings = options.addContentSettings;

        instance.model = options.model || {};

        instance.autoEditOnAdd = options.autoEditOnAdd || true;

        instance.rs = getResource(instance.baseUrl);
        instance.collection = getCollection();


        var decorateOutputSettings = options.decorateOutputSettings || {};

        instance.decorate_ext = options.decorate_ext || false;
        instance.decorateMutator_ext = options.decorateMutator_ext || false;


        instance.getModel = function(){
            return angular.copy(instance.model);
        };



        /**
         *
         * Create new item is here to avoid bug regarding post method
         *
         */
        instance.create = function(content){
            var deferred = $q.defer();
            $http.post(this.url, content).
                success(function(success){
                    deferred.resolve(success);

                    /**
                     * Add to Collection if exist
                     */
                    if(angular.isDefined(instance.collection)){
                        instance.collection.add(success.data);
                    }
                }).
                error(function(error){
                    deferred.reject(error);
                });

            return deferred.promise;
        };


        /**
         *
         * @param item
         * @param fieldName
         */
        instance.addContent = function(item, fieldName){
            console.log('addContent', item, fieldName);
            if(instance.addContentSettings && instance.addContentSettings[fieldName]){
                item[fieldName] = item[fieldName] || [];

                var modelToAdd = instance.addContentSettings[fieldName].model || [];

                if(instance.autoEditOnAdd){
                    modelToAdd.onEdit = true;
                }

                item[fieldName].push(angular.copy(modelToAdd))
            }
        }


        /**
         * Decorate the Output
         * @param items
         * @returns {Array}
         */



        instance.decorateOutputArray = function(items){
            var decoratedItems = [];
            if(angular.isArray(items)){
                for (var i = 0; i < items.length; i++)
                {
                    var item = instance.decorateOutputItem(items[i]);


                    // by http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript

                    item.nameRandom = CoreHelperFactory.guid();
                    item.indexOrder = i;

                    decoratedItems.push(item);
                }
            }

            return decoratedItems;
        }

        instance.decorateOutputItem = function(item){
            //
            if(decorateOutputSettings.trustFieldsHtml) {
                //item = restFactory.htmlTrustFields;
            }

            if(instance.decorate_ext){
                item = instance.decorate_ext(item);
            }
            return item;
        }

        // @TODO later escape fields by deep tree walking
        instance.escapeTrustHtmlFields = function(item, fieldStringsArray){
            // create array from fields
            for(var i = 0; fieldStringsArray.length; i++){
                fieldsArray = fieldStringsArray.split(".");

                var fieldIndex  = 0;
                while(field){

                }


            }
        }

        /**
         * Decorate input if needed
         */

        instance.decorateMutatorArray = function(items){
            if(!instance.decorateMutator){
                return items;
            }

            var decoratedItems = [];
            for (var i = 0; i < items.length; i++)
            {
                var item = instance.decorateMutator(items[i]);
                decoratedItems.push(item);
            }
            return decoratedItems;
        }

        instance.decorateMutator = function(item){
            if(instance.decorateMutator_ext){
                item = instance.decorateMutator_ext(item);
            }
            return item;
        }

        return instance;

    }

    return {
        getCollection: getCollection,
        getResource: getResource,
        getInstance: getInstance
    };


    /**
     * Private functions
     * @param baseUrl
     * @returns {*}
     */


    function getResource(baseUrl){
        var resource = $resource(baseUrl + '/:id?', {id: "@id"}, {
            'update': { method:'PUT' },
            'queryCache':  {method:'GET', isArray:true, cache: true}
        });

        return resource;
    };

    function getCollection(){
        return $collection.getInstance();
    };






};
/**
 * Created by shaiyerushalmi on 10/20/15.
 */


/**
 *
 * Used for ng-repeat to show only items that are on edit mode
 *
 * If none of the items is onEdit - then it will show all
 *
 */
angular.module("ngCoreRest")
    .filter('showOnlyOnEdit', function(){
        return function(items){

            var response = [];

            for(var j = 0; j < items.length; j++){
                var item = items[j];

                if(item.onEdit){
                    response.push(item);
                }
            }

            response = (!response.length) ? items : response;

            return response;




        }
    })

;
angular.module("ngCoreRest").controller("CoreFormController", CoreFormController);

CoreFormController.$inject = [];


function CoreFormController(){


    var vm = this;

    vm.name = "CoreFormController"  ;




}


/**
 * Directive for for form input
 *
 * Types:
 *
 * default - input
 * textarea
 * textareaQuill
 */



angular.module("ngCoreRest").directive("coreFormInput", coreFormInput);

coreFormInput.$inject = ['$timeout'];


function coreFormInput($timeout){

    var directive ={
        link: linkFunc,
        templateUrl: 'views/angularCoreRest/formInputElement.ng.html',
        restrict: 'A',
        scope: {
            fieldModel: '=',
            fieldTitle: '@',
            fieldName: '@',
            inputType: '@',
            checked: '='
        },
        controller: 'CoreFormController',
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;


    function linkFunc(scope, el, attr, vm){

        scope.inputType = vm.inputType;

        if(scope.inputType == 'checkbox'){
            if(vm.checked){
                scope.checked = true;
                vm.fieldModel = true;
            } else {
                //scope.checked = true;
                vm.fieldModel = false;
            }


        }


        //replaceAll
        var fieldId = "";
        if(vm.fieldTitle){
            fieldId = vm.fieldTitle.replace(/ /g,'');
        }
        

        scope.inputId = 'input_' + vm.fieldTitle + '_' + Math.random();


    }


}


/**
 * Directive for for form input
 *
 * Types:
 *
 * default - input
 * textarea
 * textareaQuill
 */



angular.module("ngCoreRest").directive("coreFormQuill", coreFormQuill);

coreFormQuill.$inject = ['$timeout'];


function coreFormQuill($timeout){

    var directive ={
        link: linkFunc,
        templateUrl: 'views/angularCoreRest/formQuillElement.ng.html',
        restrict: 'A',
        scope: {
            fieldModel: '=',
            fieldTitle: '@',
            inputType: '@'
        },
        controller: 'CoreFormController',
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;


    function linkFunc(scope, el, attr, vm){

        scope.editActive = false;

        scope.fieldModel = vm.fieldModel;

        scope.$on('textChanged', function(event,data){
            console.log('textChanged', data[0]);
            vm.fieldModel = data[0];
            event.preventDefault();

            //$timeout(function(){
            //    scope.$apply();
            //},5);

        })

        scope.$on('editActive', function(event,data){
            console.log('editActive', data[0]);
            scope.editActive = data[0];
            event.preventDefault();

        })

        scope.$watch('vm.fieldModel', function () {



            console.log('updateText - vm.fieldModel !!', vm.fieldModel);


            //return $scope.ngModel;
        });



        console.log('scope.fieldModel', scope.fieldModel);

        scope.inputType = vm.inputType;

        scope.inputId = 'input_' + vm.fieldModel + '_' + Math.random();

        scope.editorName = 'editor_' + vm.fieldModel + '_' + Math.random();


    }


}


angular.module("ngCoreRest").controller("CoreListController", CoreListController);

CoreListController.$inject = ['CoreCollectionFactory'];


function CoreListController(CoreCollectionFactory){


    var vm = this;



    vm.name = "gulp watch" +
        "";

    vm.remove = function(item) {

        console.log(vm.name, vm);

        CoreCollectionFactory.unsetItem(item, vm.collectionArray);
    }



}


angular.module("ngCoreRest").run(["$templateCache", function($templateCache) {$templateCache.put("views/angularCoreRest/coreCkeditor.ng.html","<p>\n    <div ng-show=\"editActive\">\n        <textarea cols=\"80\" id=\"[[editorName]]\" name=\"[[editorName]]\" ng-model=\"vm.ngModel\" rows=\"10\" ></textarea>\n    </div>\n\n\n\n    <div class=\"editQuill\" ng-show=\"!editActive\" ng-click=\"init()\">\n        <div ng-bind-html=\"vm.ngModel\"></div>\n        <i class=\"material-icons\">mode_edit</i>\n    </div>\n</p>\n");
$templateCache.put("views/angularCoreRest/formInputElement.ng.html","<div class=\"input-field\" ng-switch=\"inputType\">\n\n\n    <span ng-switch-when=\"datepicker\">\n        <input type=\"date\" id=\"[[vm.content.nameRandom]]\" class=\"datepicker\" ncm-datepicker bind-to-model=\"vm.fieldModel\">\n        <label for=\"[[vm.content.nameRandom]]\" class=\"active\">[[vm.fieldTitle]]</label>\n    </span>\n\n    <span ng-switch-when=\"textareaQuill\">\n        <div ng-quill-editor text-model=\"vm.fieldModel\" on-edit=\"vm.content.onEdit\"></div>\n    </span>\n\n    <span ng-switch-when=\"textarea\">\n        <textarea id=\"[[inputId]]\"  ng-model=\"vm.fieldModel\" class=\"materialize-textarea\"></textarea>\n        <label for=\"[[inputId]]\" ng-class=\"{active:vm.fieldModel}\">[[vm.fieldTitle]]</label>\n    </span>\n\n    <span ng-switch-when=\"checkbox\">\n        <input type=\"checkbox\" id=\"[[inputId]]\"  ng-model=\"vm.fieldModel\" class=\"filled-in\" value=\"true\" ng-checked=\"checked\"/>\n        <label for=\"[[inputId]]\" >[[vm.fieldTitle]]</label>\n    </span>\n    <span ng-switch-default>\n        <input id=\"[[inputId]]\" type=\"text\" ng-model=\"vm.fieldModel\" class=\"validate\" name=\"vm.fieldName\">\n        <label for=\"[[inputId]]\" ng-class=\"{active:vm.fieldModel}\">[[vm.fieldTitle]]</label>\n    </span>\n\n\n</div>\n\n\n\n");
$templateCache.put("views/angularCoreRest/formQuillElement.ng.html","\n\n<div class=\"ngQuillWrapper\">\n    <div ng-show=\"editActive\">\n        <ng-quill-editor name=\"editorName\" callback=\"editorCallback(editor, name)\" ng-model=\"fieldModel\" text=\"fieldModel\" translations=\"translations\"\n                         toolbar=\"true\" show-toolbar=\"true\" link-tooltip=\"true\" image-tooltip=\"false\"\n                         toolbar-entries=\"font size bold list bullet italic underline strike align color background link\"\n                         editor-required=\"true\" required=\"\" error-class=\"input-error\"\n                         fontsize-options=\"fontsizeOptions\" fontfamily-options=\"fontfamilyOptions\">\n\n        </ng-quill-editor>\n    </div>\n\n\n    <div class=\"editQuill\" ng-show=\"!editActive\">\n        <div ng-bind-html=\"fieldModel\"></div>\n        <i class=\"material-icons\">mode_edit</i>\n    </div>\n</div>\n\n\n\n");}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5nQ29yZVJlc3RBcHAuanMiLCJkaXJlY3RpdmVzL0NvcmVDa2VkaXRvckNvbnRyb2xsZXIuanMiLCJkaXJlY3RpdmVzL2NvbnRlbnRFZGl0YWJsZS5qcyIsImRpcmVjdGl2ZXMvY29yZUNrZWRpdG9yRGlyZWN0aXZlLmpzIiwiZGlyZWN0aXZlcy9jb3JlS2VlcFJhdGlvRGlyZWN0aXZlLmpzIiwiZmFjdG9yaWVzL0NvcmVBZGRBdXRvY29tcGxldGVEaXJlY3RpdmVGYWN0b3J5LmpzIiwiZmFjdG9yaWVzL0NvcmVBZG1pbkRpcmVjdGl2ZUZhY3RvcnkuanMiLCJmYWN0b3JpZXMvQ29yZUF1dG9jb21wbGV0ZURpcmVjdGl2ZUZhY3RvcnkuanMiLCJmYWN0b3JpZXMvQ29yZUNvbGxlY3Rpb25GYWN0b3J5LmpzIiwiZmFjdG9yaWVzL0NvcmVIZWxwZXJGYWN0b3J5LmpzIiwiZmFjdG9yaWVzL0NvcmVMb2NhbGVGYWN0b3J5LmpzIiwiZmFjdG9yaWVzL0NvcmVSZXN0Q3RybEZhY3RvcnkuanMiLCJmYWN0b3JpZXMvQ29yZVJlc3RGYWN0b3J5LmpzIiwiZmlsdGVycy9zaG93T25seU9uRWRpdEZpbHRlci5qcyIsImZvcm0vQ29yZUZvcm1Db250cm9sbGVyLmpzIiwiZm9ybS9jb3JlRm9ybUlucHV0RGlyZWN0aXZlLmpzIiwiZm9ybS9jb3JlRm9ybVF1aWxsRGlyZWN0aXZlLmpzIiwibGlzdC9Db3JlTGlzdENvbnRyb2xsZXIuanMiLCJ0ZW1wbGF0ZXMvdGVtcGxhdGVDYWNoZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcGZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBIiwiZmlsZSI6Im5nQ29yZVJlc3RBcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEFuZ3VsYXIgQ29yZSBSZXN0IC0gVGhlIENvcmUgUmVzdCBtb2R1bGUgZm9yIEFuZ3VsYXJKU1xuICogQHZlcnNpb24gdjAuMi4yIC0gMjAxNS0xMS0xMFxuICogQGF1dGhvciBTaGFpIFllcnVzaGFsbWlcbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5hbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIixbXSk7IiwiYW5ndWxhci5tb2R1bGUoXCJuZ0NvcmVSZXN0XCIpLmNvbnRyb2xsZXIoXCJDb3JlQ2tlZGl0b3JDb250cm9sbGVyXCIsIENvcmVDa2VkaXRvckNvbnRyb2xsZXIpO1xuXG5Db3JlQ2tlZGl0b3JDb250cm9sbGVyLiRpbmplY3QgPSBbXTtcblxuXG5mdW5jdGlvbiBDb3JlQ2tlZGl0b3JDb250cm9sbGVyKCl7XG5cblxuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICB2bS5uYW1lID0gXCJDb3JlQ2tlZGl0b3JDb250cm9sbGVyXCIgIDtcblxuXG5cblxufVxuXG4iLCIvKipcbiAqIHJlcXVpcmVzIHJlZmFjdG9yaW5nIHRvIHdvcmsgYmV0dGVyXG4gKi9cblxuXG5hbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuZGlyZWN0aXZlKFwiY29udGVudEVkaXRhYmxlXCIsIGNvbnRlbnRFZGl0YWJsZSk7XG5cbmNvbnRlbnRFZGl0YWJsZS4kaW5qZWN0ID0gW107XG5cbmZ1bmN0aW9uIGNvbnRlbnRFZGl0YWJsZSAoKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbG0sIGF0dHJzLCBjdHJsKSB7XG4gICAgICAgICAgICAvLyB2aWV3IC0+IG1vZGVsXG4gICAgICAgICAgICBlbG0uYmluZCgnYmx1cicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kc2V0Vmlld1ZhbHVlKGVsbS5odG1sKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIG1vZGVsIC0+IHZpZXdcbiAgICAgICAgICAgIGN0cmwucmVuZGVyID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICBlbG0uaHRtbCh2YWx1ZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBsb2FkIGluaXQgdmFsdWUgZnJvbSBET01cbiAgICAgICAgICAgIGN0cmwuJHNldFZpZXdWYWx1ZShlbG0uaHRtbCgpKTtcblxuICAgICAgICAgICAgZWxtLmJpbmQoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwia2V5ZG93biBcIiArIGV2ZW50LndoaWNoKTtcbiAgICAgICAgICAgICAgICB2YXIgZXNjID0gZXZlbnQud2hpY2ggPT0gMjcsXG4gICAgICAgICAgICAgICAgICAgIGVsID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAgICAgICAgICAgaWYgKGVzYykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImVzY1wiKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC4kc2V0Vmlld1ZhbHVlKGVsbS5odG1sKCkpO1xuICAgICAgICAgICAgICAgICAgICBlbC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfTtcblxufTsiLCIvKipcbiAqIERpcmVjdGl2ZSBmb3IgZm9yIGZvcm0gaW5wdXRcbiAqXG4gKiBUeXBlczpcbiAqXG4gKiBkZWZhdWx0IC0gaW5wdXRcbiAqIHRleHRhcmVhXG4gKiB0ZXh0YXJlYVF1aWxsXG4gKi9cblxuLyoqXG4gKiBJbiBjYXNlIG9mIGVycm9yIHBsZWFzZSBjaGVjayB0aGUgcmVmZXJlbmNlOlxuICogaHR0cHM6Ly9naXRodWIuY29tL2Vzdml0L25nLWNrZWRpdG9yL2Jsb2IvbWFzdGVyL25nLWNrZWRpdG9yLmpzXG4gKi9cblxuXG5hbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuZGlyZWN0aXZlKFwiY29yZUNrZWRpdG9yXCIsIGNvcmVDa2VkaXRvcik7XG5cbmNvcmVDa2VkaXRvci4kaW5qZWN0ID0gWyckdGltZW91dCcsICdNYWluU3RhdHVzRmFjdG9yeSddO1xuXG5cbmZ1bmN0aW9uIGNvcmVDa2VkaXRvcigkdGltZW91dCwgTWFpblN0YXR1c0ZhY3Rvcnkpe1xuXG4gICAgdmFyIGRpcmVjdGl2ZSA9e1xuICAgICAgICBsaW5rOiBsaW5rRnVuYyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd2aWV3cy9hbmd1bGFyQ29yZVJlc3QvY29yZUNrZWRpdG9yLm5nLmh0bWwnLFxuICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbmdNb2RlbDogJz0nLFxuICAgICAgICAgICAgZmllbGRUaXRsZTogJ0AnLFxuICAgICAgICB9LFxuICAgICAgICBjb250cm9sbGVyOiAnQ29yZUNrZWRpdG9yQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuICAgIH07XG5cbiAgICByZXR1cm4gZGlyZWN0aXZlO1xuXG5cbiAgICBmdW5jdGlvbiBsaW5rRnVuYyhzY29wZSwgZWwsIGF0dHIsIHZtKXtcblxuICAgICAgICB2YXIgZWRpdG9ySW5zdGFuY2U7XG4gICAgICAgIHZhciBjb250ZW50RGlyZWN0aW9uID0gJ2x0cic7XG4gICAgICAgIHZhciBjb250ZW50TGFuZ3VhZ2UgPSAnZW4nO1xuXG4gICAgICAgIGlmKGFuZ3VsYXIuaXNEZWZpbmVkKGF0dHIubGFuZ3VhZ2UpICYmIGF0dHIubGFuZ3VhZ2UgPT0gJ2hlYnJldycpe1xuICAgICAgICAgICAgY29udGVudERpcmVjdGlvbiA9ICdydGwnO1xuICAgICAgICAgICAgY29udGVudExhbmd1YWdlID0gJ2hlJztcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3BlLmVkaXRvck5hbWUgPSAnY2tlZGl0b3InICsgTWF0aC5yYW5kb20oKTtcbiAgICAgICAgc2NvcGUuaW5pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpbml0RWRpdG9yKCk7XG4gICAgICAgIH07XG5cblxuICAgICAgICBpZihhbmd1bGFyLmlzRGVmaW5lZChhdHRyLmluaXRFZGl0KSB8fCB2bS5uZ01vZGVsID09IFwiXCIpe1xuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpbml0RWRpdG9yKCk7XG5cbiAgICAgICAgICAgIH0sMSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29uZmlnQ2tlZGl0b3IgPSB7XG4gICAgICAgICAgICAvL3Rvb2xiYXI6IGNvbmZpZy50b29sYmFyX0Z1bGwsXG4gICAgICAgICAgICAvLyBEZWZpbmUgdGhlIHRvb2xiYXIgZ3JvdXBzIGFzIGl0IGlzIGEgbW9yZSBhY2Nlc3NpYmxlIHNvbHV0aW9uLlxuICAgICAgICAgICAgdGl0bGU6IHZtLmZpZWxkVGl0bGUsXG4gICAgICAgICAgICBjb250ZW50c0xhbmdEaXJlY3Rpb246IGNvbnRlbnREaXJlY3Rpb24sXG4gICAgICAgICAgICAvL2xhbmd1YWdlX2xpc3Q6IFsgJ2VuOkVuZ2xpc2gnLCdoZTpIZWJyZXc6cnRsJ10sXG4gICAgICAgICAgICBjb250ZW50c0xhbmd1YWdlOiBjb250ZW50TGFuZ3VhZ2UsXG4gICAgICAgICAgICAvL2RlZmF1bHRMYW5ndWFnZTogJ2hlJyxcbiAgICAgICAgICAgIHVpQ29sb3I6ICcjNjA5OUI2JyxcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSByZWR1bmRhbnQgYnV0dG9ucyBmcm9tIHRvb2xiYXIgZ3JvdXBzIGRlZmluZWQgYWJvdmUuXG4gICAgICAgICAgICByZW1vdmVCdXR0b25zOiAnRmxhc2gsTGFuZ3VhZ2UnXG4gICAgICAgICAgICAvL3JlbW92ZUJ1dHRvbnM6ICdVbmRlcmxpbmUsU3RyaWtlLFN1YnNjcmlwdCxTdXBlcnNjcmlwdCxBbmNob3IsU3R5bGVzLFNwZWNpYWxjaGFyJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdja2VkaXQgLSBjcy5jb25maWcuaXNBZG1pbicsIGNzLmNvbmZpZy5pc0FkbWluKTtcbiAgICAgICAgaWYoIU1haW5TdGF0dXNGYWN0b3J5LmlzQWRtaW4pe1xuICAgICAgICAgICAgY29uZmlnQ2tlZGl0b3IudG9vbGJhciA9XG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnYmFzaWNzdHlsZXMnLCBpdGVtcyA6IFsgJ0JvbGQnLCdJdGFsaWMnIF0gfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6ICdsaW5rcycsIGl0ZW1zIDogWyAnTGluaycsJ1VubGluaycgXSB9LFxuICAgICAgICAgICAgICAgIC8vIHsgbmFtZTogJ2RvY3VtZW50JywgaXRlbXMgOiBbICdTb3VyY2UnXSB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogJ3BhcmFncmFwaCcsIGl0ZW1zIDogWyAnTnVtYmVyZWRMaXN0JywnQnVsbGV0ZWRMaXN0JyBdIH0sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnc3R5bGVzJywgaXRlbXMgOiBbJ0Zvcm1hdCddIH1cbiAgICAgICAgICAgIF07XG5cblxuICAgICAgICAgICAgY29uZmlnQ2tlZGl0b3IuZm9ybWF0X3RhZ3MgPSAgJ2gyO2gzO2g0JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZ0NrZWRpdG9yLnRvb2xiYXJHcm91cHMgPSAgW1xuICAgICAgICAgICAgICAgIHtcIm5hbWVcIjpcImJhc2ljc3R5bGVzXCIsXCJncm91cHNcIjpbXCJiYXNpY3N0eWxlc1wiXX0sXG4gICAgICAgICAgICAgICAge1wibmFtZVwiOlwibGlua3NcIixcImdyb3Vwc1wiOltcImxpbmtzXCJdfSxcbiAgICAgICAgICAgICAgICB7XCJuYW1lXCI6XCJwYXJhZ3JhcGhcIixcImdyb3Vwc1wiOltcImxpc3RcIixcImJsb2Nrc1wiLCAnYWxpZ24nLCAnYmlkaSddfSxcbiAgICAgICAgICAgICAgICB7XCJuYW1lXCI6XCJkb2N1bWVudFwiLFwiZ3JvdXBzXCI6W1wibW9kZVwiXX0sXG4gICAgICAgICAgICAgICAge1wibmFtZVwiOlwiaW5zZXJ0XCIsXCJncm91cHNcIjpbXCJpbnNlcnRcIl19LFxuICAgICAgICAgICAgICAgIHtcIm5hbWVcIjpcInN0eWxlc1wiLFwiZ3JvdXBzXCI6W1wic3R5bGVzXCJdfSxcbiAgICAgICAgICAgICAgICB7XCJuYW1lXCI6XCJhYm91dFwiLFwiZ3JvdXBzXCI6W1wiYWJvdXRcIl19XG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdEVkaXRvcigpe1xuICAgICAgICAgICAgc2NvcGUuZWRpdEFjdGl2ZSA9IHRydWU7XG5cblxuICAgICAgICAgICAgZWRpdG9ySW5zdGFuY2UgPSBDS0VESVRPUi5yZXBsYWNlKCBzY29wZS5lZGl0b3JOYW1lLCBjb25maWdDa2VkaXRvciApO1xuXG4gICAgICAgICAgICBlZGl0b3JJbnN0YW5jZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuc2hvd0RhdGEoKTtcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICB9LDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBzY29wZS5zaG93RGF0YSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGVkaXRvckluc3RhbmNlLmdldERhdGEoKTtcbiAgICAgICAgICAgIHZtLm5nTW9kZWwgPSBkYXRhO1xuXG4gICAgICAgIH1cblxuXG5cblxuICAgIH1cblxuXG59XG5cbiIsImFuZ3VsYXIubW9kdWxlKFwibmdDb3JlUmVzdFwiKS5kaXJlY3RpdmUoXCJjb3JlS2VlcFJhdGlvXCIsIGNvcmVLZWVwUmF0aW8pO1xuXG5jb3JlS2VlcFJhdGlvLiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cblxuZnVuY3Rpb24gY29yZUtlZXBSYXRpbygkdGltZW91dCl7XG5cbiAgICB2YXIgZGlyZWN0aXZlID17XG4gICAgICAgIGxpbms6IGxpbmtGdW5jLFxuXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB3aWR0aFRvSGVpZ2h0UmF0aW86IFwiPVwiLFxuICAgICAgICAgICAgcmVsYXRpdmVFbGVtZW50U2VsZWN0b3I6IFwiPVwiXG4gICAgICAgIH0sXG5cbiAgICB9O1xuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcblxuXG4gICAgZnVuY3Rpb24gbGlua0Z1bmMoc2NvcGUsIGVsLCBhdHRyKXtcblxuICAgICAgICB2YXIgcmVzaXplVGltZXI7XG5cbiAgICAgICAgdmFyIHJlbGF0aXZlRWxlbWVudCA9IGVsO1xuICAgICAgICB2YXIgcmF0aW8gPSBzY29wZS53aWR0aFRvSGVpZ2h0UmF0aW8gfHwgMTtcbiAgICAgICAgaWYoc2NvcGUucmVsYXRpdmVFbGVtZW50U2VsZWN0b3Ipe1xuICAgICAgICAgICAgcmVsYXRpdmVFbGVtZW50ID0gJChzY29wZS5yZWxhdGl2ZUVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuXG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICAkKCB3aW5kb3cgKS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVzaXplKCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwxKTtcblxuICAgICAgICAkdGltZW91dChyZXNpemUsIDIwMDApO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluaXQoKXtcbiAgICAgICAgICAgIHJlc2l6ZSgpO1xuICAgICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG5cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldEhlaWdodCgpe1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IHJlbGF0aXZlRWxlbWVudC53aWR0aCgpICogcmF0aW87XG5cbiAgICAgICAgICAgIHJldHVybiBoZWlnaHQ7XG4gICAgICAgIH1cblxuXG5cbiAgICAgICAgZnVuY3Rpb24gcmVzaXplKCl7XG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gZ2V0SGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIHJlbGF0aXZlRWxlbWVudC5oZWlnaHQoaGVpZ2h0KTtcblxuXG4gICAgICAgIH1cbiAgICB9XG59XG5cbiIsIi8qKlxuICogTm90IGNvbXBsZXRlZFxuICogT24gZ29pbmcgd29yayEhISFcbiAqL1xuXG5hbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuZmFjdG9yeShcIkNvcmVBZGRBdXRvY29tcGxldGVEaXJlY3RpdmVGYWN0b3J5XCIsIGNvcmVBZGRBdXRvY29tcGxldGVEaXJlY3RpdmVGYWN0b3J5KTtcblxuY29yZUFkZEF1dG9jb21wbGV0ZURpcmVjdGl2ZUZhY3RvcnkuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcblxuZnVuY3Rpb24gY29yZUFkZEF1dG9jb21wbGV0ZURpcmVjdGl2ZUZhY3RvcnkgKCR0aW1lb3V0KXtcblxuXG5cbiAgICB2YXIgZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbih2bSwgb3B0aW9ucyl7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB2YXIgZHluYW1pY0NvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwgJ1BhZ2VDb250cm9sbGVyJztcbiAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IHtcbiAgICAgICAgICAgIGxpbms6IGxpbmtGdW5jLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2aWV3cy9wYXJ0aWFscy9hZGQtYXV0b2NvbXBsZXRlLm5nLmh0bWwnLFxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgY29udGVudDogJz0nLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRBcnJheTogJz0nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGR5bmFtaWNDb250cm9sbGVyLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIG92ZXJyaWRlIGRpcmVjdGl2ZSBvcHRpb25zXG4gICAgICAgICAqL1xuXG4gICAgICAgIGZvcihvcHRpb24gaW4gb3B0aW9ucyl7XG4gICAgICAgICAgICBkaXJlY3RpdmVbb3B0aW9uXSA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG5cblxuXG4gICAgICAgIGZ1bmN0aW9uIGxpbmtGdW5jKHNjb3BlLCBlbCwgYXR0ciwgdm0pe1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtVGl0bGUgPSAob3B0aW9ucy5pdGVtVGl0bGUpID8gb3B0aW9ucy5pdGVtVGl0bGUgOiAnaXRlbSc7XG4gICAgICAgICAgICBzY29wZS5tdWx0aXBsZVNlbGVjdCA9IG9wdGlvbnMubXVsdGlwbGVTZWxlY3Q7XG5cbiAgICAgICAgICAgIHNjb3BlLmFkZEl0ZW0gPSBmdW5jdGlvbih0aXRsZSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FkZEl0ZW0hJyk7XG4gICAgICAgICAgICAgICAgaWYoYW5ndWxhci5pc0FycmF5KHZtLmNvbnRlbnRBcnJheSkpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBpdGVtID0gYW5ndWxhci5jb3B5KG9wdGlvbnMubW9kZWxGYWN0b3J5KTtcblxuICAgICAgICAgICAgICAgICAgICBpZih0aXRsZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRpdGxlID0gdGl0bGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaXRlbS5vbkVkaXQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHZtLmNvbnRlbnRBcnJheS5wdXNoKGl0ZW0pO1xuXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwxKTtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcbiAgICB9O1xufTsiLCIvKipcbiAqIE5vdCBjb21wbGV0ZWRcbiAqIE9uIGdvaW5nIHdvcmshISEhXG4gKi9cblxuYW5ndWxhci5tb2R1bGUoXCJuZ0NvcmVSZXN0XCIpLmZhY3RvcnkoXCJDb3JlQWRtaW5EaXJlY3RpdmVGYWN0b3J5XCIsIENvcmVBZG1pbkRpcmVjdGl2ZUZhY3RvcnkpO1xuXG5Db3JlQWRtaW5EaXJlY3RpdmVGYWN0b3J5LiRpbmplY3QgPSBbJyR0aW1lb3V0J107XG5cbmZ1bmN0aW9uIENvcmVBZG1pbkRpcmVjdGl2ZUZhY3RvcnkgKCR0aW1lb3V0KXtcblxuXG5cbiAgICB2YXIgZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbih2bSwgb3B0aW9ucyl7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB2YXIgZHluYW1pY0NvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwgJ1BhZ2VDb250cm9sbGVyJztcbiAgICAgICAgXG5cbiAgICAgICAgdmFyIGRpcmVjdGl2ZSA9e1xuICAgICAgICAgICAgbGluazogbGlua0Z1bmMsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3ZpZXdzL2FkbWluL3BhcnRpYWxzL2FkbWluLWRpcmVjdGl2ZS5uZy5odG1sJyxcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICc9JyxcbiAgICAgICAgICAgICAgICBjb250ZW50Q29sbGVjdGlvbjogJz0nLFxuICAgICAgICAgICAgICAgIHNvcnRhYmxlOiAnPScsXG4gICAgICAgICAgICAgICAgaW5kZXg6ICc9JyxcbiAgICAgICAgICAgICAgICBpbnRlcm5hbEVkaXQ6ICdAJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGR5bmFtaWNDb250cm9sbGVyLFxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICAgICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuICAgICAgICB9O1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIG92ZXJyaWRlIGRpcmVjdGl2ZSBvcHRpb25zXG4gICAgICAgICAqL1xuXG4gICAgICAgIGZvcihvcHRpb24gaW4gb3B0aW9ucyl7XG4gICAgICAgICAgICBkaXJlY3RpdmVbb3B0aW9uXSA9IG9wdGlvbnNbb3B0aW9uXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkaXJlY3RpdmU7XG5cblxuXG4gICAgICAgIGZ1bmN0aW9uIGxpbmtGdW5jKHNjb3BlLCBlbCwgYXR0ciwgdm0pe1xuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ3ZtLml0ZW1VcGRhdGVkQ291bnRlcicsIGZ1bmN0aW9uKGNvdW50ZXIpIHtcbiAgICAgICAgICAgICAgICBpZihjb3VudGVyID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIE1hdGVyaWFsaXplLnRvYXN0KCdDb250ZW50IFVwZGF0ZWQ6ICcgKyB2bS5jb250ZW50LnRpdGxlLCAyNTAwLCAncm91bmRlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bS5jb250ZW50Lm9uRWRpdCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sMSlcblxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0SW5zdGFuY2U6IGdldEluc3RhbmNlXG4gICAgfTtcbn07IiwiYW5ndWxhci5tb2R1bGUoXCJuZ0NvcmVSZXN0XCIpLmZhY3RvcnkoXCJDb3JlQXV0b2NvbXBsZXRlRGlyZWN0aXZlRmFjdG9yeVwiLCBjb3JlQXV0b2NvbXBsZXRlRGlyZWN0aXZlRmFjdG9yeSk7XG5cbmNvcmVBdXRvY29tcGxldGVEaXJlY3RpdmVGYWN0b3J5LiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRjb2xsZWN0aW9uJywnJGh0dHAnXTtcblxuZnVuY3Rpb24gY29yZUF1dG9jb21wbGV0ZURpcmVjdGl2ZUZhY3RvcnkgKCR0aW1lb3V0LCAkY29sbGVjdGlvbiwkaHR0cCl7XG5cblxuXG4gICAgdmFyIGdldEluc3RhbmNlID0gZnVuY3Rpb24odm0sIG9wdGlvbnMpe1xuXG4gICAgICAgIHZhciBkZWZhdWx0TWluaW11bUNoYXJzID0gMjtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB2YXIgZHluYW1pY0NvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXIgfHwgJ1BhZ2VDb250cm9sbGVyJztcbiAgICAgICAgdmFyIGRpcmVjdGl2ZSA9IHtcbiAgICAgICAgICAgIGxpbms6IGxpbmtGdW5jLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd2aWV3cy9wYXJ0aWFscy9hdXRvY29tcGxldGUubmcuaHRtbCcsXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBzZWFyY2g6ICc9JyxcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVJdGVtSWQ6ICc9PycsXG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlSXRlbTogJz0nLFxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZUl0ZW1BdHRyOiAnQCcsXG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlSXRlbUF0dHJNb2RlbDogJz0nLFxuICAgICAgICAgICAgICAgIG1pbmltdW1DaGFyczogJ0AnLFxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZUl0ZW1zQXJyYXk6ICc9JyxcbiAgICAgICAgICAgICAgICBkZWZhdWx0SWQ6ICdAJyxcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIE11bHRpcGxlIHNlbGVjdCBvcHRpb25zXG4gICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICBtdWx0aXBsZVNlbGVjdDogJz0nLFxuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZUl0ZW1zOiAnPSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250cm9sbGVyOiBkeW5hbWljQ29udHJvbGxlcixcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcbiAgICAgICAgfTtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBvdmVycmlkZSBkaXJlY3RpdmUgb3B0aW9uc1xuICAgICAgICAgKi9cblxuICAgICAgICBmb3Iob3B0aW9uIGluIG9wdGlvbnMpe1xuICAgICAgICAgICAgZGlyZWN0aXZlW29wdGlvbl0gPSBvcHRpb25zW29wdGlvbl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGlyZWN0aXZlO1xuXG5cblxuICAgICAgICBmdW5jdGlvbiBsaW5rRnVuYyhzY29wZSwgZWwsIGF0dHIsIHZtKXtcblxuICAgICAgICAgICAgdmFyIGxvYWRpbmdEZWxheUFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGRlbGF5VGltZW91dCA9IDEwMDA7XG5cbiAgICAgICAgICAgIHZhciB0eXBpbmdEZWxheVRpbWVvdXQgPSA1MDA7XG5cbiAgICAgICAgICAgIHZhciB0eXBpbmdBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICAgICAgYWN0aXZhdGVMb2FkaW5nRGVsYXkoKTtcblxuXG4gICAgICAgICAgICBzY29wZS5hdXRvY29tcGxldGVDb2xsZWN0aW9uID0gJGNvbGxlY3Rpb24uZ2V0SW5zdGFuY2UoKTtcbiAgICAgICAgICAgIHNjb3BlLmF1dG9jb21wbGV0ZUNvbGxlY3Rpb25TZWxlY3RlZCA9ICRjb2xsZWN0aW9uLmdldEluc3RhbmNlKCk7XG5cblxuICAgICAgICAgICAgc2NvcGUuYXV0b2NvbXBsZXRlID0gW107XG5cbiAgICAgICAgICAgIHZhciBtaW5pbXVtQ2hhcnMgPSBzY29wZS52bS5taW5pbXVtQ2hhcnMgfHwgZGVmYXVsdE1pbmltdW1DaGFycztcblxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnbWluaW11bUNoYXJzJywgbWluaW11bUNoYXJzKTtcblxuICAgICAgICAgICAgdmFyIGRlZmF1bHRJZCA9IHNjb3BlLnZtLmRlZmF1bHRJZCB8fCAwO1xuXG4gICAgICAgICAgICB2YXIgbXVsdGlwbGVTZWxlY3QgPSBzY29wZS52bS5tdWx0aXBsZVNlbGVjdCB8fCBmYWxzZTtcblxuXG4gICAgICAgICAgICAvL3RyeSB0byB0YWtlIG91dCBtYXkgY2F1c2UgZXJyb3JzXG4gICAgICAgICAgICAvL3Njb3BlLnZtLmF1dG9jb21wbGV0ZUl0ZW1zID0gYXV0b2NvbXBsZXRlQ29sbGVjdGlvblNlbGVjdGVkLmFycmF5O1xuXG5cblxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIFdhdGNoIGZvciBjaGFuZ2UgaW4gdGhlIHRleHRcbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBzY29wZS4kd2F0Y2goJ3ZtLnNlYXJjaCcsIGZ1bmN0aW9uKHNlYXJjaCkge1xuXG4gICAgICAgICAgICAgICAgaWYoIXNlYXJjaCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWFyY2ggPSBzZWFyY2gudHJpbSgpO1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FjdGl2YXRlIHdhdGNoOicsIHNlYXJjaCk7XG4gICAgICAgICAgICAgICAgYWN0aXZhdGVEZWxheVR5cGluZygpO1xuXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgaWYoIXR5cGluZ0FjdGl2ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmF0ZUZldGNoUmVzdWx0cyhzZWFyY2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9LHR5cGluZ0RlbGF5VGltZW91dCk7XG5cblxuXG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZURlbGF5VHlwaW5nKCl7XG4gICAgICAgICAgICAgICAgdHlwaW5nQWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0eXBpbmdBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIH0sdHlwaW5nRGVsYXlUaW1lb3V0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZmV0Y2hSZXN1bHRzKCl7XG4gICAgICAgICAgICAgICAgYWN0aXZhdGVGZXRjaFJlc3VsdHMoc2VhcmNoKTtcbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJlc2V0Rm9yU2luZ2xlU2VsZWN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3ZtcmVzZXQnLCB2bS5tdWx0aXBsZVNlbGVjdCwgdm0pO1xuICAgICAgICAgICAgICAgIGlmKCF2bS5tdWx0aXBsZVNlbGVjdCl7XG4gICAgICAgICAgICAgICAgICAgIGlmKHNjb3BlLnZtLmF1dG9jb21wbGV0ZUl0ZW1zQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmF1dG9jb21wbGV0ZUNvbGxlY3Rpb25TZWxlY3RlZC5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnZtLmF1dG9jb21wbGV0ZUl0ZW1zQXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL3Jlc2V0IGFsbCBvdGhlciBpbnB1dHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBuZy1jbGljayBzZWxlY3QgaXRlbVxuICAgICAgICAgICAgICogQHBhcmFtIGl0ZW1cbiAgICAgICAgICAgICAqIEBwYXJhbSBjaGVja2VkXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgc2NvcGUudm0uc2VsZWN0SXRlbSA9IGZ1bmN0aW9uKGl0ZW0sIGNoZWNrZWQsIHBhcmFtVG9GaWxsKXtcbiAgICAgICAgICAgICAgICBiaW5kTW91c2VPdXQoKTtcbiAgICAgICAgICAgICAgICBpZihjaGVja2VkKXtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogYWN0aXZhdGUgZGVsYXlcbiAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnZtLmF1dG9jb21wbGV0ZUl0ZW0gPSBzY29wZS52bS5hdXRvY29tcGxldGVJdGVtIHx8IHt9O1xuXG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIGhhbmRsZSBtdWx0aXBsZVNlbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgKiBAdHlwZSB7Kn1cbiAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgcmVzZXRGb3JTaW5nbGVTZWxlY3Rpb24oKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvbkVkaXQgPSBhbmd1bGFyLmNvcHkoc2NvcGUudm0uYXV0b2NvbXBsZXRlSXRlbS5vbkVkaXQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlTG9hZGluZ0RlbGF5KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGF1dG9jb21wbGV0ZVBhcmFtID0gaXRlbS5pZDtcbiAgICAgICAgICAgICAgICAgICAgaWYocGFyYW1Ub0ZpbGwgJiYgaXRlbVtwYXJhbVRvRmlsbF0pe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlUGFyYW0gPSBpdGVtW3BhcmFtVG9GaWxsXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnZtLmF1dG9jb21wbGV0ZUl0ZW1JZCA9ICBhdXRvY29tcGxldGVQYXJhbTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudm0uYXV0b2NvbXBsZXRlSXRlbSA9IGFuZ3VsYXIuY29weShpdGVtKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIC8vcmVtb3ZlIG90aGVyIGlmIG5vdCBtdWx0aXBsZVxuICAgICAgICAgICAgICAgICAgICBpZighbXVsdGlwbGVTZWxlY3Qpe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9hdXRvY29tcGxldGVDb2xsZWN0aW9uU2VsZWN0ZWQucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5zaG93QXV0b2NvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5zaG93QXV0b2NvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnY2hlY2tlZCcpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzY29wZS52bS5hdXRvY29tcGxldGVJdGVtQXR0ciApO1xuICAgICAgICAgICAgICAgICAgICBpZihzY29wZS52bS5hdXRvY29tcGxldGVJdGVtQXR0ciApe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudm0uYXV0b2NvbXBsZXRlSXRlbUF0dHJNb2RlbCA9IGl0ZW1bc2NvcGUudm0uYXV0b2NvbXBsZXRlSXRlbUF0dHJdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoc2NvcGUudm0uYXV0b2NvbXBsZXRlSXRlbXNBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS52bS5hdXRvY29tcGxldGVJdGVtc0FycmF5LnB1c2goaXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzY29wZS52bS5hdXRvY29tcGxldGVJdGVtJyxzY29wZS52bS5hdXRvY29tcGxldGVJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzY29wZS52bS5hdXRvY29tcGxldGVJdGVtc0FycmF5JyxzY29wZS52bS5hdXRvY29tcGxldGVJdGVtc0FycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2NvcGUudm0uYXV0b2NvbXBsZXRlSXRlbSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUudm0uYXV0b2NvbXBsZXRlSXRlbS5kZWxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRWRpdCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9vbkVkaXQgPSBzY29wZS52bS5tdWx0aXBsZTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnZtLmF1dG9jb21wbGV0ZUl0ZW0ub25FZGl0ID0gb25FZGl0O1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBIaWRlcyB0aGUgYm94IGJ5IHRoZSB0ZW1wbGF0ZSBuZy1zaG93IGFyZ3VtZW50XG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAvL3Njb3BlLmF1dG9jb21wbGV0ZUNvbGxlY3Rpb24ucmVtb3ZlQWxsKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXV0b2NvbXBsZXRlQ29sbGVjdGlvblNlbGVjdGVkLmFkZChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS52bS5hdXRvY29tcGxldGVJdGVtSWQgPSBkZWZhdWx0SWQ7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnZtLmF1dG9jb21wbGV0ZUl0ZW0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuYXV0b2NvbXBsZXRlQ29sbGVjdGlvblNlbGVjdGVkLnJlbW92ZShpdGVtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBwYXJhbSBzZWFyY2hcbiAgICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBhY3RpdmF0ZUZldGNoUmVzdWx0cyhzZWFyY2gpe1xuICAgICAgICAgICAgICAgIGlmKHNlYXJjaCAmJiAhdHlwaW5nQWN0aXZlICYmICFsb2FkaW5nRGVsYXlBY3RpdmUgJiYgc2VhcmNoLmxlbmd0aCA+PSBtaW5pbXVtQ2hhcnMpe1xuICAgICAgICAgICAgICAgICAgICBmZXRjaEF1dG9jb21wbGV0ZVJlc3VsdHMoc2VhcmNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYWN0aXZhdGVMb2FkaW5nRGVsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZmV0Y2hBdXRvY29tcGxldGVSZXN1bHRzKHNlYXJjaCl7XG5cbiAgICAgICAgICAgICAgICBzY29wZS5zaG93QXV0b2NvbXBsZXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGlmKHNjb3BlLmxvYWRpbmdEZWxheUFjdGl2ZSB8fCB2bS5sb2FkaW5nIHx8ICFzZWFyY2ggfHwgc2VhcmNoLmxlbmd0aCA8IG1pbmltdW1DaGFycyl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0YXJ0IHJlZnJlc2gnKTtcbiAgICAgICAgICAgICAgICBpZihvcHRpb25zLnVybCl7XG4gICAgICAgICAgICAgICAgICAgIHZtLmxvYWRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBvcHRpb25zLnVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiB7c2VhcmNoOiBzZWFyY2h9XG5cbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiBzdWNjZXNzQ2FsbGJhY2socmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmF1dG9jb21wbGV0ZUNvbGxlY3Rpb24ucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5hdXRvY29tcGxldGVDb2xsZWN0aW9uLmFkZEFsbChyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gZXJyb3JDYWxsYmFjayhyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2V0cnJyb3InLCByZXNwb25zZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZighb3B0aW9ucy51cmwpe1xuICAgICAgICAgICAgICAgICAgICB2bS5yZWZyZXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaDpzZWFyY2gsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBzY29wZS5hdXRvY29tcGxldGVDb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpcyBpdGVtIHNlbGVjdGVkXG4gICAgICAgICAgICAgKiBAcGFyYW0gaXRlbVxuICAgICAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAgICAgKi9cblxuXG4gICAgICAgICAgICBzY29wZS5pc0NoZWNrZWQgPSBmdW5jdGlvbihpdGVtKXtcblxuICAgICAgICAgICAgICAgIHZhciBpc0NoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZihzY29wZS5hdXRvY29tcGxldGVDb2xsZWN0aW9uU2VsZWN0ZWQuZ2V0KGl0ZW0uaWQpKXtcbiAgICAgICAgICAgICAgICAgICAgaXNDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzQ2hlY2tlZDtcbiAgICAgICAgICAgIH1cblxuXG5cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBBY3RpdmF0ZSBsb2FkaW5nIGRlbGF5IHRvIGF2b2lkIG11bHRpcGxlIGFqYXggY2FsbHNcbiAgICAgICAgICAgICAqIEBwYXJhbSBzZWNvbmRzXG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgZnVuY3Rpb24gYWN0aXZhdGVMb2FkaW5nRGVsYXkoc2Vjb25kcyl7XG4gICAgICAgICAgICAgICAgdmFyIGRlbGF5VGltZW91dExvY2FsID0gc2Vjb25kcyB8fCBkZWxheVRpbWVvdXQ7XG5cbiAgICAgICAgICAgICAgICBsb2FkaW5nRGVsYXlBY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGluZ0RlbGF5QWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSwgZGVsYXlUaW1lb3V0TG9jYWwpO1xuXG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLy9lbXB0eSBsaXN0IHRvIGhpZGUgdGhlIGF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgZnVuY3Rpb24gYmluZE1vdXNlT3V0KCl7XG4gICAgICAgICAgICAgICAgZWwuYmluZCgnbW91c2VvdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbW91c2VvdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIEVtcHR5IGxpc3RcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmKCFtdWx0aXBsZVNlbGVjdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2F1dG9jb21wbGV0ZUNvbGxlY3Rpb25TZWxlY3RlZC5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnNob3dBdXRvY29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuc2hvd0F1dG9jb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9zY29wZS5hdXRvY29tcGxldGVDb2xsZWN0aW9uLnJlbW92ZUFsbCgpO1xuICAgICAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICAgICAgZWwudW5iaW5kKCdtb3VzZW91dCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGdldEluc3RhbmNlOiBnZXRJbnN0YW5jZVxuICAgIH07XG59OyIsImFuZ3VsYXIubW9kdWxlKFwibmdDb3JlUmVzdFwiKS5mYWN0b3J5KFwiQ29yZUNvbGxlY3Rpb25GYWN0b3J5XCIsIENvcmVDb2xsZWN0aW9uRmFjdG9yeSk7XG5cbkNvcmVDb2xsZWN0aW9uRmFjdG9yeS4kaW5qZWN0ID0gW107XG5mdW5jdGlvbiBDb3JlQ29sbGVjdGlvbkZhY3RvcnkgKCl7XG5cblxuXG4gICAgdmFyIHNlcnZpY2UgPSB7XG4gICAgICAgIHJlbW92ZUJ5SW5kZXg6IHJlbW92ZUJ5SW5kZXgsXG4gICAgICAgIHVuc2V0SXRlbTogdW5zZXRJdGVtXG4gICAgfTtcblxuXG5cbiAgICByZXR1cm4gc2VydmljZTtcblxuXG4gICAgLyoqXG4gICAgICogUHJpdmF0ZSBmdW5jdGlvbnMgYXJlYVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge3t9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG5cblxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQnlJbmRleChpdGVtcywgaW5kZXgpIHtcbiAgICAgICAgaWYoaXRlbXMgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsMSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5zZXRJdGVtKGl0ZW0sIGl0ZW1zLCBmb3JjZSl7XG5cblxuICAgICAgICBpZihmb3JjZSA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgaWYoIWNvbmZpcm0oJ1JlbW92ZT8nKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoaXRlbXMgaW5zdGFuY2VvZiBBcnJheSl7XG5cbiAgICAgICAgICAgIHZhciBpbmRleCA9IGl0ZW1zLmluZGV4T2YoaXRlbSk7XG4gICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogaWYgaXRlbXMgaXMgYSBjb2xsZWN0aW9uIHRoZW4gdHJ5IHRvIHJlbW92ZVxuICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBpdGVtcyA9PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgICAgICBpdGVtcy5yZW1vdmUoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cblxuXG5cbiAgICB9XG5cblxuXG59OyIsIlxuYW5ndWxhci5tb2R1bGUoXCJuZ0NvcmVSZXN0XCIpLmZhY3RvcnkoXCJDb3JlSGVscGVyRmFjdG9yeVwiLCBDb3JlSGVscGVyRmFjdG9yeSk7XG5cbkNvcmVIZWxwZXJGYWN0b3J5LiRpbmplY3QgPSBbXTtcblxuZnVuY3Rpb24gQ29yZUhlbHBlckZhY3RvcnkgKCl7XG4gICAgXG4gICAgXG4gICAgdmFyIHNlcnZpY2UgPSB7XG4gICAgICAgIGd1aWQ6IGd1aWRcbiAgICB9O1xuICAgIFxuICAgIHJldHVybiBzZXJ2aWNlO1xuXG4gICAgZnVuY3Rpb24gZ3VpZCgpe1xuICAgICAgICBmdW5jdGlvbiBzNCgpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxuICAgICAgICAgICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgICAgICAgICAuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzNCgpICsgczQoKSArICctJyArIHM0KCkgKyAnLScgKyBzNCgpICsgJy0nICtcbiAgICAgICAgICAgIHM0KCkgKyAnLScgKyBzNCgpICsgczQoKSArIHM0KCk7XG4gICAgfVxuICAgIFxuICAgIFxuICAgIFxufVxuXG5cblxuXG5cblxuXG4iLCJhbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuZmFjdG9yeShcIkNvcmVMb2NhbGVGYWN0b3J5XCIsIENvcmVMb2NhbGVGYWN0b3J5KTtcblxuQ29yZUxvY2FsZUZhY3RvcnkuJGluamVjdCA9IFtdO1xuZnVuY3Rpb24gQ29yZUxvY2FsZUZhY3RvcnkgKCl7XG5cblxuXG4gICAgdmFyIHNlcnZpY2UgPSB7XG4gICAgICAgIGlzU3RyQ29udGFpbkhlYnJldzogaXNTdHJDb250YWluSGVicmV3XG4gICAgICAgIFxuICAgIH07XG5cblxuXG4gICAgcmV0dXJuIHNlcnZpY2U7XG5cblxuICAgIC8qKlxuICAgICAqIFByaXZhdGUgZnVuY3Rpb25zIGFyZWFcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqIEByZXR1cm5zIHt7fX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuXG4gICAgdmFyIEhlYnJld0NoYXJzID0gbmV3IFJlZ0V4cChcIl5bXFx1MDU5MC1cXHUwNUZGXSskXCIpO1xuICAgIHZhciBBbHBoYU51bWVyaWNDaGFycyA9IG5ldyBSZWdFeHAoXCJeW2EtekEtWjAtOVxcLV0rJFwiKTtcbiAgICB2YXIgRW5nbGlzaENoYXJzID0gbmV3IFJlZ0V4cChcIl5bYS16QS1aXFwtXSskXCIpO1xuICAgIHZhciBMZWdhbENoYXJzID0gbmV3IFJlZ0V4cChcIl5bYS16QS1aXFwtXFx1MDU5MC1cXHUwNUZGIF0rJFwiKTtcblxuXG4gICAgZnVuY3Rpb24gaXNTdHJDb250YWluSGVicmV3IChjb250ZW50KXtcblxuICAgICAgICBpc0hlYnJldyA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udGVudC5sZW5ndGg7IGkrKylcbiAgICAgICAge1xuXG4gICAgICAgICAgICB2YXIgY2hhclRlc3QgPSBjb250ZW50LmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgICBpZiAoKGNoYXJUZXN0ID4gMHg1OTApICYmIChjaGFyVGVzdCA8IDB4NUZGKSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjaGFyVGVzdFwiLCBjaGFyVGVzdCk7XG4gICAgICAgICAgICAgICAgaXNIZWJyZXcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFyIGlzSGVicmV3ID0gSGVicmV3Q2hhcnMudGVzdChjb250ZW50KTtcblxuXG4gICAgICAgIHJldHVybiBpc0hlYnJldztcblxuXG4gICAgfVxuXG5cblxufTsiLCJhbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuZmFjdG9yeShcIkNvcmVSZXN0Q3RybEZhY3RvcnlcIiwgY3NSZXN0Q3RybEZhY3RvcnkpO1xuXG5jc1Jlc3RDdHJsRmFjdG9yeS4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJ107XG5mdW5jdGlvbiBjc1Jlc3RDdHJsRmFjdG9yeSAoJHJvb3RTY29wZSl7XG5cbiAgICB2YXIgZ2V0SW5zdGFuY2UgPSBmdW5jdGlvbih2bSwgcmVzdEZhY3Rvcnkpe1xuXG4gICAgICAgIHZtLmNvdW50ZXJQb3N0ID0gMDtcbiAgICAgICAgdm0ucmVzcG9uc2VFcnJvciA9IGZhbHNlO1xuICAgICAgICB2bS5pdGVtVXBkYXRlZENvdW50ZXIgPSAwO1xuICAgICAgICB2bS5hY3RpdmVJdGVtcyA9IHt9O1xuICAgICAgICB2bS5hY3RpdmVJdGVtSWQgPSAwO1xuICAgICAgICB2bS5kZWZhdWx0S2V5ID0gJ2RlZmF1bHRLZXknO1xuICAgICAgICB2bS5jdXJyZW50RnVsbFJlc3BvbnNlID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGRlZmF1bHQgaXRlbSB0byBzYXZlIG9uRWRpdFxuICAgICAgICAgKiBXaWxsIHJldmVydCB0byBpdCBvbiBjYW5jZWwgZWRpdFxuICAgICAgICAgKiBAdHlwZSB7e319XG4gICAgICAgICAqL1xuICAgICAgICB2bS5lZGl0T3JnSXRlbSA9IHt9O1xuXG4gICAgICAgIGlmKHJlc3RGYWN0b3J5LmNvbGxlY3Rpb24pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHZtLmNvbnRlbnRzID0gcmVzdEZhY3RvcnkuY29sbGVjdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQ2FsbGJhY2sgZm9yIGNyZWF0ZSBmdW5jdGlvblxuICAgICAgICAgKi9cblxuICAgICAgICB2bS5jcmVhdGVDYWxsYmFjayA9IHJlc3RGYWN0b3J5LmNyZWF0ZUNhbGxiYWNrIHx8IGZ1bmN0aW9uKCl7fTtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWNvcmF0ZSB0aGUgb3V0cHV0IGZyb20gdGhlIHNlcnZlciBmb2xsb3dpbmcgZ2V0XG4gICAgICAgICAqL1xuXG4gICAgICAgIGlmKHJlc3RGYWN0b3J5LmRlY29yYXRlX2V4dCl7XG4gICAgICAgICAgICB2bS5kZWNvcmF0ZV9leHQgPSByZXN0RmFjdG9yeS5kZWNvcmF0ZV9leHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2bS5kZWNvcmF0ZV9leHQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlY29yYXRlIHRoZSBpbnB1dCBnb2VzIHRvIHNlcnZlciBiZWZvcmUgdXBkYXRlIC8gc2F2ZVxuICAgICAgICAgKi9cblxuICAgICAgICBpZihyZXN0RmFjdG9yeS5kZWNvcmF0ZU11dGF0b3JfZXh0KXtcbiAgICAgICAgICAgIHZtLmRlY29yYXRlTXV0YXRvcl9leHQgPSByZXN0RmFjdG9yeS5kZWNvcmF0ZU11dGF0b3JfZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdm0uZGVjb3JhdGVNdXRhdG9yX2V4dCA9IGZhbHNlO1xuICAgICAgICB9XG5cblxuICAgICAgICB2YXIgX3BhcnNlUXVlcnlPcHRpb25zID0gcGFyc2VRdWVyeU9wdGlvbnM7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGdW5jdGlvbnMgZnJvbSB0aGUgd3JhcHBlckN0cmxcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqL1xuXG5cblxuICAgICAgICB2bS5yZWZyZXNoID0gZnVuY3Rpb24ob3B0aW9ucyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZtLmN1cnJlbnRGdWxsUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgICAgIHZhciBxdWVyeVBhcmFtcyA9IF9wYXJzZVF1ZXJ5T3B0aW9ucyhvcHRpb25zKTtcblxuICAgICAgICAgICAgdmFyIHJzRm4gPSAnZ2V0JztcbiAgICAgICAgICAgIGlmKG9wdGlvbnMuY2FoY2UpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcnNGbiA9ICdnZXRDYWNoZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2bS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlc3RGYWN0b3J5LnJzW3JzRm5dKHF1ZXJ5UGFyYW1zKS4kcHJvbWlzZS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3Mpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZtLmN1cnJlbnRGdWxsUmVzcG9uc2UgPSBzdWNjZXNzO1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gc3VjY2Vzcy5kYXRhO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhRGVjb3JhdGVkID0gcmVzdEZhY3RvcnkuZGVjb3JhdGVPdXRwdXRBcnJheShzdWNjZXNzKTtcblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgY3NkMS5sb2coJ3N1Y2Nlc3MnLHN1Y2Nlc3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKG9wdGlvbnMuY29sbGVjdGlvbil7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbGxlY3Rpb24ucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbGxlY3Rpb24uYWRkQWxsKGRhdGFEZWNvcmF0ZWQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVzdEZhY3RvcnkuY29sbGVjdGlvbil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uY29udGVudHMucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdm0uY29udGVudHMuYWRkQWxsKGRhdGFEZWNvcmF0ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdm0ubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3Ipe1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBCcm9hZGNhc3QgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzZXJ2ZXJFcnJvcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOmVycm9yXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgdm0ubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgbmV3IEVtcHR5IGl0ZW1cbiAgICAgICAgICovXG4gICAgICAgIHZtLmFkZE5ldyA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIHZtLm5ld0l0ZW0gPSBuZXcgcmVzdEZhY3RvcnkuZ2V0TW9kZWwoKTtcbiAgICAgICAgICAgIHZtLmVkaXRJdGVtKHZtLm5ld0l0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdm0uYWRkQ29udGVudCA9IGZ1bmN0aW9uKGl0ZW0sIG1vZGVsTmFtZSl7XG4gICAgICAgICAgICByZXR1cm4gcmVzdEZhY3RvcnkuYWRkQ29udGVudChpdGVtLCBtb2RlbE5hbWUpO1xuXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTYXZlIEl0ZW1cbiAgICAgICAgICogQHBhcmFtIGl0ZW1cbiAgICAgICAgICovXG5cbiAgICAgICAgdm0uc2F2ZSA9IGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgaWYocmVzdEZhY3RvcnkuZGVjb3JhdGVNdXRhdG9yKXtcbiAgICAgICAgICAgICAgICBpdGVtID0gcmVzdEZhY3RvcnkuZGVjb3JhdGVNdXRhdG9yKGl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihpdGVtLmlkKXtcbiAgICAgICAgICAgICAgICB1cGRhdGUoaXRlbSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNyZWF0ZShpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgYW5kIGRlbGV0ZSBpdGVtXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXG4gICAgICAgICAqL1xuICAgICAgICB2bS5yZW1vdmUgPSBmdW5jdGlvbihpdGVtLCBjb250ZW50Q29sbGVjdGlvbil7XG4gICAgICAgICAgICBpZighY29uZmlybSgnUmVtb3ZlPycpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9pZiBub3QgaW4gZGIsIHRoZW4ganVzdCByZW1vdmUgZnJvbSBjb2xsZWN0aW9uO1xuICAgICAgICAgICAgaWYoIWl0ZW0uaWQpe1xuICAgICAgICAgICAgICAgIHJlc3RGYWN0b3J5LmNvbGxlY3Rpb24ucmVtb3ZlKGl0ZW0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdm0ubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICByZXN0RmFjdG9yeS5ycy5kZWxldGUoe2lkOml0ZW0uaWR9KS4kcHJvbWlzZS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N1Y2Nlc3MnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCFjb250ZW50Q29sbGVjdGlvbil7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN0RmFjdG9yeS5jb2xsZWN0aW9uLnJlbW92ZShpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9yZW1vdmUgZnJvbSBhcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY29udGVudENvbGxlY3Rpb24gaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNvbnRlbnRDb2xsZWN0aW9uLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaXRlbSwgY29udGVudENvbGxlY3Rpb25baV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihpdGVtLmlkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGl0ZW0uaWQgPT0gY29udGVudENvbGxlY3Rpb25baV0uaWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRDb2xsZWN0aW9uLnNwbGljZShpLDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgIGlmKGl0ZW0uJCRoYXNoID09IGNvbnRlbnRDb2xsZWN0aW9uW2ldLiQkaGFzaCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBjb250ZW50Q29sbGVjdGlvbi5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL31cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB2bS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB1bnNldCBpdGVtIGZyb20gY29sbGVjdGlvbiAvIGFycmF5IHdpdGhvdXQgc2F2aW5nLlxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxuICAgICAgICAgKiBAcGFyYW0gaXRlbXNcbiAgICAgICAgICovXG4gICAgICAgIHZtLnVuc2V0SXRlbSA9IHVuc2V0SXRlbTtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZW1vdmUgYnkgaW5kZXhcbiAgICAgICAgICogQHR5cGUge3JlbW92ZUJ5SW5kZXh9XG4gICAgICAgICAqL1xuICAgICAgICB2bS5yZW1vdmVCeUluZGV4ID0gcmVtb3ZlQnlJbmRleDtcblxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENyZWF0ZSBuZXcgaXRlbVxuICAgICAgICAgKiBAcGFyYW0gbmV3SXRlbVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGNyZWF0ZSA9IGZ1bmN0aW9uKG5ld0l0ZW0pe1xuICAgICAgICAgICAgaWYodm0ubG9hZGluZyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG5ld0l0ZW1DcmVhdGUgPSBhbmd1bGFyLmNvcHkobmV3SXRlbSk7XG4gICAgICAgICAgICB2bS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHZtLmNvdW50ZXJQb3N0ICs9IDE7XG5cbiAgICAgICAgICAgIHJlc3RGYWN0b3J5LmNyZWF0ZShuZXdJdGVtQ3JlYXRlKS50aGVuKFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHN1Y2Nlc3Mpe1xuICAgICAgICAgICAgICAgICAgICB2bS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZtLml0ZW1VcGRhdGVkQ291bnRlciArPSAxO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAgICAgKiBjYWxsIGJhY2sgdG8gY3JlYXRlQ2FsbGJhY2sgaWYgZXhpc3Qgd2l0aCB0aGUgcmVzcG9uc2VcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIG5ld0l0ZW0ub25FZGl0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGlmKHZtLmNyZWF0ZUNhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtLmNyZWF0ZUNhbGxiYWNrKHN1Y2Nlc3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yLCBoZWFkZXJzKXtcbiAgICAgICAgICAgICAgICAgICAgdm0ucmVzcG9uc2VFcnJvciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGVycm9yLCBoZWFkZXJzKTtcbiAgICAgICAgICAgICAgICAgICAgdm0ubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2bS5yZXNwb25zZUVycm9yID0gJ29vcHMuLi4uJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbihlZGl0Q29udGVudCl7XG4gICAgICAgICAgICBpZih2bS5sb2FkaW5nKXtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBlZGl0Q29udGVudE9yZyA9IGFuZ3VsYXIuY29weShlZGl0Q29udGVudCk7XG4gICAgICAgICAgICB2bS5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlc3RGYWN0b3J5LnJzLnVwZGF0ZShlZGl0Q29udGVudCkuJHByb21pc2UudGhlbihcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgIHZtLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlY29yYXRlZEl0ZW0gPSByZXN0RmFjdG9yeS5kZWNvcmF0ZU91dHB1dEl0ZW0ocmVzcG9uc2UuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRlbnQgPSBkZWNvcmF0ZWRJdGVtO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmKHZtLmNvbnRlbnRzICYmIGRlY29yYXRlZEl0ZW0uaWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodm0uY29udGVudHMuZ2V0KGRlY29yYXRlZEl0ZW0uaWQpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bS5jb250ZW50cy51cGRhdGUoZGVjb3JhdGVkSXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZtLmNvbnRlbnRzLmFkZChkZWNvcmF0ZWRJdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAqIGV4aXQgZWRpdCBtb2RlXG4gICAgICAgICAgICAgICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgZWRpdENvbnRlbnQub25FZGl0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZtLnJlc2V0QWN0aXZlSXRlbSgpO1xuICAgICAgICAgICAgICAgICAgICB2bS5pdGVtVXBkYXRlZENvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaWYoIWVkaXRDb250ZW50T3JnLmlkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRDb250ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogYnJvYWRjYXN0IHN1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2VydmVyU3VjY2VzcycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yMTEnLGVycm9yKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQnJvYWRjYXN0IHN1Y2Nlc1xuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzZXJ2ZXJFcnJvcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOmVycm9yXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB2bS5zZXJ2ZXJFcnJvciA9IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICB2bS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgdm0uY2FuY2VsU2F2ZSA9IGZ1bmN0aW9uKGl0ZW0pe1xuXG4gICAgICAgICAgICBpdGVtLm9uRWRpdCA9IGZhbHNlO1xuICAgICAgICAgICAgdm0ucmVzZXRBY3RpdmVJdGVtKCk7XG5cbiAgICAgICAgICAgIGlmKHZtLmVkaXRPcmdJdGVtKXtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmNvcHkodm0uZWRpdE9yZ0l0ZW0sIGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS5vbkVkaXQgPSBmYWxzZTtcblxuICAgICAgICB9XG4gICAgICAgIHZtLnJlc2V0QWN0aXZlSXRlbSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2bS5zZXRBY3RpdmVJdGVtKHt9LCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICB2bS5hY3RpdmVJdGVtSWQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHZtLnJlc2V0RWRpdE9yZyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB2bS5lZGl0T3JnSXRlbSA9IHt9O1xuXG4gICAgICAgIH1cblxuICAgICAgICB2bS5lZGl0SXRlbSA9IGZ1bmN0aW9uKGl0ZW0pe1xuXG4gICAgICAgICAgICBpdGVtLm9uRWRpdCA9IHRydWU7XG4gICAgICAgICAgICAgYW5ndWxhci5jb3B5KGl0ZW0sIHZtLmVkaXRPcmdJdGVtKTtcblxuICAgICAgICAgICAgaXRlbS5vcGVuZWRfZm9yX2VkaXQgPSB0cnVlO1xuXG5cbiAgICAgICAgICAgIHZtLnNldEFjdGl2ZUl0ZW0oaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRW5kIEVkaXQgaXRlbSB3aXRob3V0IHNhdmVcbiAgICAgICAgICogQHBhcmFtIGl0ZW1cbiAgICAgICAgICovXG4gICAgICAgIHZtLmVuZEVkaXRJdGVtID0gZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICBpdGVtLm9uRWRpdCA9IGZhbHNlO1xuICAgICAgICAgICAgdm0ucmVzZXRBY3RpdmVJdGVtKCk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gaXRlbVxuICAgICAgICAgKiBAcGFyYW0gZm9yY2VcbiAgICAgICAgICpcbiAgICAgICAgICogVG9nZ2xlIEl0ZW0gZnJvbSBiZWluZyB0aGUgYWN0aXZlIGl0ZW1cbiAgICAgICAgICogQ2FuIGFsc28gZm9yY2UgaXQgdG8gYmUgYWN0aXZlXG4gICAgICAgICAqL1xuXG4gICAgICAgIGZ1bmN0aW9uIGdldEl0ZW1LZXkoa2V5KXtcbiAgICAgICAgICAgIGlmKCFrZXkpe1xuICAgICAgICAgICAgICAgIGtleSA9IHZtLmRlZmF1bHRLZXk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cblxuICAgICAgICB2bS5zZXRBY3RpdmVJdGVtID0gZnVuY3Rpb24oaXRlbSwga2V5LCBmb3JjZSl7XG5cbiAgICAgICAgICAgIGtleSA9IGdldEl0ZW1LZXkoa2V5KTtcblxuICAgICAgICAgICAgaXRlbSA9IGl0ZW0gfHwge307XG5cbiAgICAgICAgICAgIGlmKCh0aGlzLmlzQWN0aXZlSXRlbShpdGVtLCBrZXkpICYmICFmb3JjZSkgfHwgZm9yY2UgPT09IGZhbHNlKXtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUl0ZW1zW2tleV0gPSB7fVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUl0ZW1zW2tleV0gPSBpdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdm0uYWN0aXZlSXRlbUlkID0gaXRlbS5pZCB8fCB0cnVlO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBY3RpdmVJdGVtKGtleSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZtLmlzQWN0aXZlSXRlbSA9IGZ1bmN0aW9uKGl0ZW0sa2V5KXtcblxuICAgICAgICAgICAga2V5ID0gZ2V0SXRlbUtleShrZXkpO1xuXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmKHRoaXMuYWN0aXZlSXRlbXNba2V5XSl7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UgPSAoaXRlbS5pZCA9PSB0aGlzLmFjdGl2ZUl0ZW1zW2tleV0uaWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2bS5nZXRBY3RpdmVJdGVtID0gZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgICAgIGtleSA9IGdldEl0ZW1LZXkoa2V5KTtcblxuICAgICAgICAgICAgdmFyIGl0ZW07XG4gICAgICAgICAgICBpZihhbmd1bGFyLmlzRGVmaW5lZCh0aGlzLmFjdGl2ZUl0ZW1zW2tleV0pKXtcbiAgICAgICAgICAgICAgICBpdGVtID0gdGhpcy5hY3RpdmVJdGVtc1trZXldO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtID0gdGhpcy5zZXRBY3RpdmVJdGVtKGtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICAgIHZtLmdldEFjdGl2ZUl0ZW1JZCA9IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IHZtLmdldEFjdGl2ZUl0ZW0oa2V5KTtcblxuICAgICAgICAgICAgdmFyIGlkID0gZmFsc2U7XG4gICAgICAgICAgICBpZihpdGVtKXtcbiAgICAgICAgICAgICAgICBpZCA9IGl0ZW0uaWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgfVxuXG5cblxuXG5cbiAgICAgICAgcmV0dXJuIHZtO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBQcml2YXRlIGZ1bmN0aW9ucyBhcmVhXG4gICAgICogQHBhcmFtIG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7e319XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cblxuXG4gICAgZnVuY3Rpb24gcGFyc2VRdWVyeU9wdGlvbnMob3B0aW9ucyl7XG4gICAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHt9O1xuICAgICAgICB2YXIgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgaWYob3B0aW9ucy5xdWVyeVBhcmFtcyl7XG4gICAgICAgICAgICBmb3IocGFyYW0gaW4gb3B0aW9ucy5xdWVyeVBhcmFtcyl7XG4gICAgICAgICAgICAgICAgcXVlcnlQYXJhbXNbcGFyYW1dID0gb3B0aW9ucy5xdWVyeVBhcmFtc1twYXJhbV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihvcHRpb25zLnNlYXJjaCl7XG4gICAgICAgICAgICBxdWVyeVBhcmFtcy5zZWFyY2ggPSBvcHRpb25zLnNlYXJjaDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcXVlcnlQYXJhbXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlQnlJbmRleChpdGVtcywgaW5kZXgpIHtcbiAgICAgICAgaWYoaXRlbXMgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsMSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXRlbXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5zZXRJdGVtKGl0ZW0sIGl0ZW1zLCBmb3JjZSl7XG5cblxuICAgICAgICBpZihmb3JjZSA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgaWYoIWNvbmZpcm0oJ1JlbW92ZT8nKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoaXRlbXMgaW5zdGFuY2VvZiBBcnJheSl7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwIDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgICAgICBpZihpdGVtLmlkID09IGl0ZW1zW2ldLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpLDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBpZiBpdGVtcyBpcyBhIGNvbGxlY3Rpb24gdGhlbiB0cnkgdG8gcmVtb3ZlXG4gICAgICAgICAqL1xuXG5cbiAgICAgICAgaWYodHlwZW9mIGl0ZW1zID09ICdvYmplY3QnKXtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgICBpdGVtcy5yZW1vdmUoaXRlbSk7XG4gICAgICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn07IiwiXG5hbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuZmFjdG9yeShcIkNvcmVSZXN0RmFjdG9yeVwiLCBDb3JlUmVzdEZhY3RvcnkpO1xuXG5Db3JlUmVzdEZhY3RvcnkuJGluamVjdCA9IFsnJGNvbGxlY3Rpb24nLCAnJHJlc291cmNlJywgJyRodHRwJywgJyRxJywnJHNjZScsICdDb3JlSGVscGVyRmFjdG9yeSddO1xuXG5mdW5jdGlvbiBDb3JlUmVzdEZhY3RvcnkgKCRjb2xsZWN0aW9uLCAkcmVzb3VyY2UsICRodHRwLCAkcSwgJHNjZSwgQ29yZUhlbHBlckZhY3Rvcnkpe1xuXG5cblxuXG5cblxuXG4gICAgdmFyIGdldEluc3RhbmNlID0gZnVuY3Rpb24ob3B0aW9ucyl7XG5cbiAgICAgICAgdmFyIGluc3RhbmNlID0ge307XG4gICAgICAgIFxuICAgICAgICBpbnN0YW5jZS5jb25maWcgPSBvcHRpb25zLmNvbmZpZyB8fCB7fTtcbiAgICAgICAgXG4gICAgICAgIGluc3RhbmNlLmJhc2VVcmwgPSBvcHRpb25zLmJhc2VVcmw7XG5cbiAgICAgICAgaW5zdGFuY2UudXJsID0gb3B0aW9ucy5iYXNlVXJsO1xuICAgICAgICBpbnN0YW5jZS5hZGRDb250ZW50U2V0dGluZ3MgPSBvcHRpb25zLmFkZENvbnRlbnRTZXR0aW5ncztcblxuICAgICAgICBpbnN0YW5jZS5tb2RlbCA9IG9wdGlvbnMubW9kZWwgfHwge307XG5cbiAgICAgICAgaW5zdGFuY2UuYXV0b0VkaXRPbkFkZCA9IG9wdGlvbnMuYXV0b0VkaXRPbkFkZCB8fCB0cnVlO1xuXG4gICAgICAgIGluc3RhbmNlLnJzID0gZ2V0UmVzb3VyY2UoaW5zdGFuY2UuYmFzZVVybCk7XG4gICAgICAgIGluc3RhbmNlLmNvbGxlY3Rpb24gPSBnZXRDb2xsZWN0aW9uKCk7XG5cblxuICAgICAgICB2YXIgZGVjb3JhdGVPdXRwdXRTZXR0aW5ncyA9IG9wdGlvbnMuZGVjb3JhdGVPdXRwdXRTZXR0aW5ncyB8fCB7fTtcblxuICAgICAgICBpbnN0YW5jZS5kZWNvcmF0ZV9leHQgPSBvcHRpb25zLmRlY29yYXRlX2V4dCB8fCBmYWxzZTtcbiAgICAgICAgaW5zdGFuY2UuZGVjb3JhdGVNdXRhdG9yX2V4dCA9IG9wdGlvbnMuZGVjb3JhdGVNdXRhdG9yX2V4dCB8fCBmYWxzZTtcblxuXG4gICAgICAgIGluc3RhbmNlLmdldE1vZGVsID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmNvcHkoaW5zdGFuY2UubW9kZWwpO1xuICAgICAgICB9O1xuXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQ3JlYXRlIG5ldyBpdGVtIGlzIGhlcmUgdG8gYXZvaWQgYnVnIHJlZ2FyZGluZyBwb3N0IG1ldGhvZFxuICAgICAgICAgKlxuICAgICAgICAgKi9cbiAgICAgICAgaW5zdGFuY2UuY3JlYXRlID0gZnVuY3Rpb24oY29udGVudCl7XG4gICAgICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgJGh0dHAucG9zdCh0aGlzLnVybCwgY29udGVudCkuXG4gICAgICAgICAgICAgICAgc3VjY2VzcyhmdW5jdGlvbihzdWNjZXNzKXtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzdWNjZXNzKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogQWRkIHRvIENvbGxlY3Rpb24gaWYgZXhpc3RcbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIGlmKGFuZ3VsYXIuaXNEZWZpbmVkKGluc3RhbmNlLmNvbGxlY3Rpb24pKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLmNvbGxlY3Rpb24uYWRkKHN1Y2Nlc3MuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5cbiAgICAgICAgICAgICAgICBlcnJvcihmdW5jdGlvbihlcnJvcil7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSBpdGVtXG4gICAgICAgICAqIEBwYXJhbSBmaWVsZE5hbWVcbiAgICAgICAgICovXG4gICAgICAgIGluc3RhbmNlLmFkZENvbnRlbnQgPSBmdW5jdGlvbihpdGVtLCBmaWVsZE5hbWUpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FkZENvbnRlbnQnLCBpdGVtLCBmaWVsZE5hbWUpO1xuICAgICAgICAgICAgaWYoaW5zdGFuY2UuYWRkQ29udGVudFNldHRpbmdzICYmIGluc3RhbmNlLmFkZENvbnRlbnRTZXR0aW5nc1tmaWVsZE5hbWVdKXtcbiAgICAgICAgICAgICAgICBpdGVtW2ZpZWxkTmFtZV0gPSBpdGVtW2ZpZWxkTmFtZV0gfHwgW107XG5cbiAgICAgICAgICAgICAgICB2YXIgbW9kZWxUb0FkZCA9IGluc3RhbmNlLmFkZENvbnRlbnRTZXR0aW5nc1tmaWVsZE5hbWVdLm1vZGVsIHx8IFtdO1xuXG4gICAgICAgICAgICAgICAgaWYoaW5zdGFuY2UuYXV0b0VkaXRPbkFkZCl7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsVG9BZGQub25FZGl0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpdGVtW2ZpZWxkTmFtZV0ucHVzaChhbmd1bGFyLmNvcHkobW9kZWxUb0FkZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWNvcmF0ZSB0aGUgT3V0cHV0XG4gICAgICAgICAqIEBwYXJhbSBpdGVtc1xuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICAgICAqL1xuXG5cblxuICAgICAgICBpbnN0YW5jZS5kZWNvcmF0ZU91dHB1dEFycmF5ID0gZnVuY3Rpb24oaXRlbXMpe1xuICAgICAgICAgICAgdmFyIGRlY29yYXRlZEl0ZW1zID0gW107XG4gICAgICAgICAgICBpZihhbmd1bGFyLmlzQXJyYXkoaXRlbXMpKXtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSBpbnN0YW5jZS5kZWNvcmF0ZU91dHB1dEl0ZW0oaXRlbXNbaV0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYnkgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvY3JlYXRlLWd1aWQtdXVpZC1pbi1qYXZhc2NyaXB0XG5cbiAgICAgICAgICAgICAgICAgICAgaXRlbS5uYW1lUmFuZG9tID0gQ29yZUhlbHBlckZhY3RvcnkuZ3VpZCgpO1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmluZGV4T3JkZXIgPSBpO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlY29yYXRlZEl0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGVjb3JhdGVkSXRlbXM7XG4gICAgICAgIH1cblxuICAgICAgICBpbnN0YW5jZS5kZWNvcmF0ZU91dHB1dEl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBpZihkZWNvcmF0ZU91dHB1dFNldHRpbmdzLnRydXN0RmllbGRzSHRtbCkge1xuICAgICAgICAgICAgICAgIC8vaXRlbSA9IHJlc3RGYWN0b3J5Lmh0bWxUcnVzdEZpZWxkcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoaW5zdGFuY2UuZGVjb3JhdGVfZXh0KXtcbiAgICAgICAgICAgICAgICBpdGVtID0gaW5zdGFuY2UuZGVjb3JhdGVfZXh0KGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBAVE9ETyBsYXRlciBlc2NhcGUgZmllbGRzIGJ5IGRlZXAgdHJlZSB3YWxraW5nXG4gICAgICAgIGluc3RhbmNlLmVzY2FwZVRydXN0SHRtbEZpZWxkcyA9IGZ1bmN0aW9uKGl0ZW0sIGZpZWxkU3RyaW5nc0FycmF5KXtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhcnJheSBmcm9tIGZpZWxkc1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgZmllbGRTdHJpbmdzQXJyYXkubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgICAgIGZpZWxkc0FycmF5ID0gZmllbGRTdHJpbmdzQXJyYXkuc3BsaXQoXCIuXCIpO1xuXG4gICAgICAgICAgICAgICAgdmFyIGZpZWxkSW5kZXggID0gMDtcbiAgICAgICAgICAgICAgICB3aGlsZShmaWVsZCl7XG5cbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERlY29yYXRlIGlucHV0IGlmIG5lZWRlZFxuICAgICAgICAgKi9cblxuICAgICAgICBpbnN0YW5jZS5kZWNvcmF0ZU11dGF0b3JBcnJheSA9IGZ1bmN0aW9uKGl0ZW1zKXtcbiAgICAgICAgICAgIGlmKCFpbnN0YW5jZS5kZWNvcmF0ZU11dGF0b3Ipe1xuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGRlY29yYXRlZEl0ZW1zID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaW5zdGFuY2UuZGVjb3JhdGVNdXRhdG9yKGl0ZW1zW2ldKTtcbiAgICAgICAgICAgICAgICBkZWNvcmF0ZWRJdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRlY29yYXRlZEl0ZW1zO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5zdGFuY2UuZGVjb3JhdGVNdXRhdG9yID0gZnVuY3Rpb24oaXRlbSl7XG4gICAgICAgICAgICBpZihpbnN0YW5jZS5kZWNvcmF0ZU11dGF0b3JfZXh0KXtcbiAgICAgICAgICAgICAgICBpdGVtID0gaW5zdGFuY2UuZGVjb3JhdGVNdXRhdG9yX2V4dChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0Q29sbGVjdGlvbjogZ2V0Q29sbGVjdGlvbixcbiAgICAgICAgZ2V0UmVzb3VyY2U6IGdldFJlc291cmNlLFxuICAgICAgICBnZXRJbnN0YW5jZTogZ2V0SW5zdGFuY2VcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBQcml2YXRlIGZ1bmN0aW9uc1xuICAgICAqIEBwYXJhbSBiYXNlVXJsXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG5cblxuICAgIGZ1bmN0aW9uIGdldFJlc291cmNlKGJhc2VVcmwpe1xuICAgICAgICB2YXIgcmVzb3VyY2UgPSAkcmVzb3VyY2UoYmFzZVVybCArICcvOmlkPycsIHtpZDogXCJAaWRcIn0sIHtcbiAgICAgICAgICAgICd1cGRhdGUnOiB7IG1ldGhvZDonUFVUJyB9LFxuICAgICAgICAgICAgJ3F1ZXJ5Q2FjaGUnOiAge21ldGhvZDonR0VUJywgaXNBcnJheTp0cnVlLCBjYWNoZTogdHJ1ZX1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc291cmNlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRDb2xsZWN0aW9uKCl7XG4gICAgICAgIHJldHVybiAkY29sbGVjdGlvbi5nZXRJbnN0YW5jZSgpO1xuICAgIH07XG5cblxuXG5cblxuXG59OyIsIi8qKlxuICogQ3JlYXRlZCBieSBzaGFpeWVydXNoYWxtaSBvbiAxMC8yMC8xNS5cbiAqL1xuXG5cbi8qKlxuICpcbiAqIFVzZWQgZm9yIG5nLXJlcGVhdCB0byBzaG93IG9ubHkgaXRlbXMgdGhhdCBhcmUgb24gZWRpdCBtb2RlXG4gKlxuICogSWYgbm9uZSBvZiB0aGUgaXRlbXMgaXMgb25FZGl0IC0gdGhlbiBpdCB3aWxsIHNob3cgYWxsXG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIilcbiAgICAuZmlsdGVyKCdzaG93T25seU9uRWRpdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpdGVtcyl7XG5cbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgaXRlbXMubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0gaXRlbXNbal07XG5cbiAgICAgICAgICAgICAgICBpZihpdGVtLm9uRWRpdCl7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXNwb25zZSA9ICghcmVzcG9uc2UubGVuZ3RoKSA/IGl0ZW1zIDogcmVzcG9uc2U7XG5cbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcblxuXG5cblxuICAgICAgICB9XG4gICAgfSlcblxuOyIsImFuZ3VsYXIubW9kdWxlKFwibmdDb3JlUmVzdFwiKS5jb250cm9sbGVyKFwiQ29yZUZvcm1Db250cm9sbGVyXCIsIENvcmVGb3JtQ29udHJvbGxlcik7XG5cbkNvcmVGb3JtQ29udHJvbGxlci4kaW5qZWN0ID0gW107XG5cblxuZnVuY3Rpb24gQ29yZUZvcm1Db250cm9sbGVyKCl7XG5cblxuICAgIHZhciB2bSA9IHRoaXM7XG5cbiAgICB2bS5uYW1lID0gXCJDb3JlRm9ybUNvbnRyb2xsZXJcIiAgO1xuXG5cblxuXG59XG5cbiIsIi8qKlxuICogRGlyZWN0aXZlIGZvciBmb3IgZm9ybSBpbnB1dFxuICpcbiAqIFR5cGVzOlxuICpcbiAqIGRlZmF1bHQgLSBpbnB1dFxuICogdGV4dGFyZWFcbiAqIHRleHRhcmVhUXVpbGxcbiAqL1xuXG5cblxuYW5ndWxhci5tb2R1bGUoXCJuZ0NvcmVSZXN0XCIpLmRpcmVjdGl2ZShcImNvcmVGb3JtSW5wdXRcIiwgY29yZUZvcm1JbnB1dCk7XG5cbmNvcmVGb3JtSW5wdXQuJGluamVjdCA9IFsnJHRpbWVvdXQnXTtcblxuXG5mdW5jdGlvbiBjb3JlRm9ybUlucHV0KCR0aW1lb3V0KXtcblxuICAgIHZhciBkaXJlY3RpdmUgPXtcbiAgICAgICAgbGluazogbGlua0Z1bmMsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAndmlld3MvYW5ndWxhckNvcmVSZXN0L2Zvcm1JbnB1dEVsZW1lbnQubmcuaHRtbCcsXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBmaWVsZE1vZGVsOiAnPScsXG4gICAgICAgICAgICBmaWVsZFRpdGxlOiAnQCcsXG4gICAgICAgICAgICBmaWVsZE5hbWU6ICdAJyxcbiAgICAgICAgICAgIGlucHV0VHlwZTogJ0AnLFxuICAgICAgICAgICAgY2hlY2tlZDogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDb3JlRm9ybUNvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcblxuXG4gICAgZnVuY3Rpb24gbGlua0Z1bmMoc2NvcGUsIGVsLCBhdHRyLCB2bSl7XG5cbiAgICAgICAgc2NvcGUuaW5wdXRUeXBlID0gdm0uaW5wdXRUeXBlO1xuXG4gICAgICAgIGlmKHNjb3BlLmlucHV0VHlwZSA9PSAnY2hlY2tib3gnKXtcbiAgICAgICAgICAgIGlmKHZtLmNoZWNrZWQpe1xuICAgICAgICAgICAgICAgIHNjb3BlLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZtLmZpZWxkTW9kZWwgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL3Njb3BlLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZtLmZpZWxkTW9kZWwgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIH1cblxuXG4gICAgICAgIC8vcmVwbGFjZUFsbFxuICAgICAgICB2YXIgZmllbGRJZCA9IFwiXCI7XG4gICAgICAgIGlmKHZtLmZpZWxkVGl0bGUpe1xuICAgICAgICAgICAgZmllbGRJZCA9IHZtLmZpZWxkVGl0bGUucmVwbGFjZSgvIC9nLCcnKTtcbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICBzY29wZS5pbnB1dElkID0gJ2lucHV0XycgKyB2bS5maWVsZFRpdGxlICsgJ18nICsgTWF0aC5yYW5kb20oKTtcblxuXG4gICAgfVxuXG5cbn1cblxuIiwiLyoqXG4gKiBEaXJlY3RpdmUgZm9yIGZvciBmb3JtIGlucHV0XG4gKlxuICogVHlwZXM6XG4gKlxuICogZGVmYXVsdCAtIGlucHV0XG4gKiB0ZXh0YXJlYVxuICogdGV4dGFyZWFRdWlsbFxuICovXG5cblxuXG5hbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuZGlyZWN0aXZlKFwiY29yZUZvcm1RdWlsbFwiLCBjb3JlRm9ybVF1aWxsKTtcblxuY29yZUZvcm1RdWlsbC4kaW5qZWN0ID0gWyckdGltZW91dCddO1xuXG5cbmZ1bmN0aW9uIGNvcmVGb3JtUXVpbGwoJHRpbWVvdXQpe1xuXG4gICAgdmFyIGRpcmVjdGl2ZSA9e1xuICAgICAgICBsaW5rOiBsaW5rRnVuYyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd2aWV3cy9hbmd1bGFyQ29yZVJlc3QvZm9ybVF1aWxsRWxlbWVudC5uZy5odG1sJyxcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGZpZWxkTW9kZWw6ICc9JyxcbiAgICAgICAgICAgIGZpZWxkVGl0bGU6ICdAJyxcbiAgICAgICAgICAgIGlucHV0VHlwZTogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDb3JlRm9ybUNvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgIGJpbmRUb0NvbnRyb2xsZXI6IHRydWVcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcblxuXG4gICAgZnVuY3Rpb24gbGlua0Z1bmMoc2NvcGUsIGVsLCBhdHRyLCB2bSl7XG5cbiAgICAgICAgc2NvcGUuZWRpdEFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgICAgIHNjb3BlLmZpZWxkTW9kZWwgPSB2bS5maWVsZE1vZGVsO1xuXG4gICAgICAgIHNjb3BlLiRvbigndGV4dENoYW5nZWQnLCBmdW5jdGlvbihldmVudCxkYXRhKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0ZXh0Q2hhbmdlZCcsIGRhdGFbMF0pO1xuICAgICAgICAgICAgdm0uZmllbGRNb2RlbCA9IGRhdGFbMF07XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAvLyR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAvLyAgICBzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIC8vfSw1KTtcblxuICAgICAgICB9KVxuXG4gICAgICAgIHNjb3BlLiRvbignZWRpdEFjdGl2ZScsIGZ1bmN0aW9uKGV2ZW50LGRhdGEpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2VkaXRBY3RpdmUnLCBkYXRhWzBdKTtcbiAgICAgICAgICAgIHNjb3BlLmVkaXRBY3RpdmUgPSBkYXRhWzBdO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB9KVxuXG4gICAgICAgIHNjb3BlLiR3YXRjaCgndm0uZmllbGRNb2RlbCcsIGZ1bmN0aW9uICgpIHtcblxuXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1cGRhdGVUZXh0IC0gdm0uZmllbGRNb2RlbCAhIScsIHZtLmZpZWxkTW9kZWwpO1xuXG5cbiAgICAgICAgICAgIC8vcmV0dXJuICRzY29wZS5uZ01vZGVsO1xuICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgY29uc29sZS5sb2coJ3Njb3BlLmZpZWxkTW9kZWwnLCBzY29wZS5maWVsZE1vZGVsKTtcblxuICAgICAgICBzY29wZS5pbnB1dFR5cGUgPSB2bS5pbnB1dFR5cGU7XG5cbiAgICAgICAgc2NvcGUuaW5wdXRJZCA9ICdpbnB1dF8nICsgdm0uZmllbGRNb2RlbCArICdfJyArIE1hdGgucmFuZG9tKCk7XG5cbiAgICAgICAgc2NvcGUuZWRpdG9yTmFtZSA9ICdlZGl0b3JfJyArIHZtLmZpZWxkTW9kZWwgKyAnXycgKyBNYXRoLnJhbmRvbSgpO1xuXG5cbiAgICB9XG5cblxufVxuXG4iLCJhbmd1bGFyLm1vZHVsZShcIm5nQ29yZVJlc3RcIikuY29udHJvbGxlcihcIkNvcmVMaXN0Q29udHJvbGxlclwiLCBDb3JlTGlzdENvbnRyb2xsZXIpO1xuXG5Db3JlTGlzdENvbnRyb2xsZXIuJGluamVjdCA9IFsnQ29yZUNvbGxlY3Rpb25GYWN0b3J5J107XG5cblxuZnVuY3Rpb24gQ29yZUxpc3RDb250cm9sbGVyKENvcmVDb2xsZWN0aW9uRmFjdG9yeSl7XG5cblxuICAgIHZhciB2bSA9IHRoaXM7XG5cblxuXG4gICAgdm0ubmFtZSA9IFwiZ3VscCB3YXRjaFwiICtcbiAgICAgICAgXCJcIjtcblxuICAgIHZtLnJlbW92ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcblxuICAgICAgICBjb25zb2xlLmxvZyh2bS5uYW1lLCB2bSk7XG5cbiAgICAgICAgQ29yZUNvbGxlY3Rpb25GYWN0b3J5LnVuc2V0SXRlbShpdGVtLCB2bS5jb2xsZWN0aW9uQXJyYXkpO1xuICAgIH1cblxuXG5cbn1cblxuIiwiYW5ndWxhci5tb2R1bGUoXCJuZ0NvcmVSZXN0XCIpLnJ1bihbXCIkdGVtcGxhdGVDYWNoZVwiLCBmdW5jdGlvbigkdGVtcGxhdGVDYWNoZSkgeyR0ZW1wbGF0ZUNhY2hlLnB1dChcInZpZXdzL2FuZ3VsYXJDb3JlUmVzdC9jb3JlQ2tlZGl0b3IubmcuaHRtbFwiLFwiPHA+XFxuICAgIDxkaXYgbmctc2hvdz1cXFwiZWRpdEFjdGl2ZVxcXCI+XFxuICAgICAgICA8dGV4dGFyZWEgY29scz1cXFwiODBcXFwiIGlkPVxcXCJbW2VkaXRvck5hbWVdXVxcXCIgbmFtZT1cXFwiW1tlZGl0b3JOYW1lXV1cXFwiIG5nLW1vZGVsPVxcXCJ2bS5uZ01vZGVsXFxcIiByb3dzPVxcXCIxMFxcXCIgPjwvdGV4dGFyZWE+XFxuICAgIDwvZGl2PlxcblxcblxcblxcbiAgICA8ZGl2IGNsYXNzPVxcXCJlZGl0UXVpbGxcXFwiIG5nLXNob3c9XFxcIiFlZGl0QWN0aXZlXFxcIiBuZy1jbGljaz1cXFwiaW5pdCgpXFxcIj5cXG4gICAgICAgIDxkaXYgbmctYmluZC1odG1sPVxcXCJ2bS5uZ01vZGVsXFxcIj48L2Rpdj5cXG4gICAgICAgIDxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+bW9kZV9lZGl0PC9pPlxcbiAgICA8L2Rpdj5cXG48L3A+XFxuXCIpO1xuJHRlbXBsYXRlQ2FjaGUucHV0KFwidmlld3MvYW5ndWxhckNvcmVSZXN0L2Zvcm1JbnB1dEVsZW1lbnQubmcuaHRtbFwiLFwiPGRpdiBjbGFzcz1cXFwiaW5wdXQtZmllbGRcXFwiIG5nLXN3aXRjaD1cXFwiaW5wdXRUeXBlXFxcIj5cXG5cXG5cXG4gICAgPHNwYW4gbmctc3dpdGNoLXdoZW49XFxcImRhdGVwaWNrZXJcXFwiPlxcbiAgICAgICAgPGlucHV0IHR5cGU9XFxcImRhdGVcXFwiIGlkPVxcXCJbW3ZtLmNvbnRlbnQubmFtZVJhbmRvbV1dXFxcIiBjbGFzcz1cXFwiZGF0ZXBpY2tlclxcXCIgbmNtLWRhdGVwaWNrZXIgYmluZC10by1tb2RlbD1cXFwidm0uZmllbGRNb2RlbFxcXCI+XFxuICAgICAgICA8bGFiZWwgZm9yPVxcXCJbW3ZtLmNvbnRlbnQubmFtZVJhbmRvbV1dXFxcIiBjbGFzcz1cXFwiYWN0aXZlXFxcIj5bW3ZtLmZpZWxkVGl0bGVdXTwvbGFiZWw+XFxuICAgIDwvc3Bhbj5cXG5cXG4gICAgPHNwYW4gbmctc3dpdGNoLXdoZW49XFxcInRleHRhcmVhUXVpbGxcXFwiPlxcbiAgICAgICAgPGRpdiBuZy1xdWlsbC1lZGl0b3IgdGV4dC1tb2RlbD1cXFwidm0uZmllbGRNb2RlbFxcXCIgb24tZWRpdD1cXFwidm0uY29udGVudC5vbkVkaXRcXFwiPjwvZGl2PlxcbiAgICA8L3NwYW4+XFxuXFxuICAgIDxzcGFuIG5nLXN3aXRjaC13aGVuPVxcXCJ0ZXh0YXJlYVxcXCI+XFxuICAgICAgICA8dGV4dGFyZWEgaWQ9XFxcIltbaW5wdXRJZF1dXFxcIiAgbmctbW9kZWw9XFxcInZtLmZpZWxkTW9kZWxcXFwiIGNsYXNzPVxcXCJtYXRlcmlhbGl6ZS10ZXh0YXJlYVxcXCI+PC90ZXh0YXJlYT5cXG4gICAgICAgIDxsYWJlbCBmb3I9XFxcIltbaW5wdXRJZF1dXFxcIiBuZy1jbGFzcz1cXFwie2FjdGl2ZTp2bS5maWVsZE1vZGVsfVxcXCI+W1t2bS5maWVsZFRpdGxlXV08L2xhYmVsPlxcbiAgICA8L3NwYW4+XFxuXFxuICAgIDxzcGFuIG5nLXN3aXRjaC13aGVuPVxcXCJjaGVja2JveFxcXCI+XFxuICAgICAgICA8aW5wdXQgdHlwZT1cXFwiY2hlY2tib3hcXFwiIGlkPVxcXCJbW2lucHV0SWRdXVxcXCIgIG5nLW1vZGVsPVxcXCJ2bS5maWVsZE1vZGVsXFxcIiBjbGFzcz1cXFwiZmlsbGVkLWluXFxcIiB2YWx1ZT1cXFwidHJ1ZVxcXCIgbmctY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCIvPlxcbiAgICAgICAgPGxhYmVsIGZvcj1cXFwiW1tpbnB1dElkXV1cXFwiID5bW3ZtLmZpZWxkVGl0bGVdXTwvbGFiZWw+XFxuICAgIDwvc3Bhbj5cXG4gICAgPHNwYW4gbmctc3dpdGNoLWRlZmF1bHQ+XFxuICAgICAgICA8aW5wdXQgaWQ9XFxcIltbaW5wdXRJZF1dXFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiBuZy1tb2RlbD1cXFwidm0uZmllbGRNb2RlbFxcXCIgY2xhc3M9XFxcInZhbGlkYXRlXFxcIiBuYW1lPVxcXCJ2bS5maWVsZE5hbWVcXFwiPlxcbiAgICAgICAgPGxhYmVsIGZvcj1cXFwiW1tpbnB1dElkXV1cXFwiIG5nLWNsYXNzPVxcXCJ7YWN0aXZlOnZtLmZpZWxkTW9kZWx9XFxcIj5bW3ZtLmZpZWxkVGl0bGVdXTwvbGFiZWw+XFxuICAgIDwvc3Bhbj5cXG5cXG5cXG48L2Rpdj5cXG5cXG5cXG5cXG5cIik7XG4kdGVtcGxhdGVDYWNoZS5wdXQoXCJ2aWV3cy9hbmd1bGFyQ29yZVJlc3QvZm9ybVF1aWxsRWxlbWVudC5uZy5odG1sXCIsXCJcXG5cXG48ZGl2IGNsYXNzPVxcXCJuZ1F1aWxsV3JhcHBlclxcXCI+XFxuICAgIDxkaXYgbmctc2hvdz1cXFwiZWRpdEFjdGl2ZVxcXCI+XFxuICAgICAgICA8bmctcXVpbGwtZWRpdG9yIG5hbWU9XFxcImVkaXRvck5hbWVcXFwiIGNhbGxiYWNrPVxcXCJlZGl0b3JDYWxsYmFjayhlZGl0b3IsIG5hbWUpXFxcIiBuZy1tb2RlbD1cXFwiZmllbGRNb2RlbFxcXCIgdGV4dD1cXFwiZmllbGRNb2RlbFxcXCIgdHJhbnNsYXRpb25zPVxcXCJ0cmFuc2xhdGlvbnNcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xiYXI9XFxcInRydWVcXFwiIHNob3ctdG9vbGJhcj1cXFwidHJ1ZVxcXCIgbGluay10b29sdGlwPVxcXCJ0cnVlXFxcIiBpbWFnZS10b29sdGlwPVxcXCJmYWxzZVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgdG9vbGJhci1lbnRyaWVzPVxcXCJmb250IHNpemUgYm9sZCBsaXN0IGJ1bGxldCBpdGFsaWMgdW5kZXJsaW5lIHN0cmlrZSBhbGlnbiBjb2xvciBiYWNrZ3JvdW5kIGxpbmtcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRvci1yZXF1aXJlZD1cXFwidHJ1ZVxcXCIgcmVxdWlyZWQ9XFxcIlxcXCIgZXJyb3ItY2xhc3M9XFxcImlucHV0LWVycm9yXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICBmb250c2l6ZS1vcHRpb25zPVxcXCJmb250c2l6ZU9wdGlvbnNcXFwiIGZvbnRmYW1pbHktb3B0aW9ucz1cXFwiZm9udGZhbWlseU9wdGlvbnNcXFwiPlxcblxcbiAgICAgICAgPC9uZy1xdWlsbC1lZGl0b3I+XFxuICAgIDwvZGl2PlxcblxcblxcbiAgICA8ZGl2IGNsYXNzPVxcXCJlZGl0UXVpbGxcXFwiIG5nLXNob3c9XFxcIiFlZGl0QWN0aXZlXFxcIj5cXG4gICAgICAgIDxkaXYgbmctYmluZC1odG1sPVxcXCJmaWVsZE1vZGVsXFxcIj48L2Rpdj5cXG4gICAgICAgIDxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+bW9kZV9lZGl0PC9pPlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG5cXG5cXG5cIik7fV0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
