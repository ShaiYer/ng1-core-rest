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

