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