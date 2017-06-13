
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







