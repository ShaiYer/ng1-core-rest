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

