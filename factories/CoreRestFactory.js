
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