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

