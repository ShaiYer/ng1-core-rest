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

