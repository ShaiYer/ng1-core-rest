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

