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