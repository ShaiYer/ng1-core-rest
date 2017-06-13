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