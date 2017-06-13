angular.module("ngCoreRest").factory("CoreLocaleFactory", CoreLocaleFactory);

CoreLocaleFactory.$inject = [];
function CoreLocaleFactory (){



    var service = {
        isStrContainHebrew: isStrContainHebrew
        
    };



    return service;


    /**
     * Private functions area
     * @param options
     * @returns {{}}
     * @private
     */

    var HebrewChars = new RegExp("^[\u0590-\u05FF]+$");
    var AlphaNumericChars = new RegExp("^[a-zA-Z0-9\-]+$");
    var EnglishChars = new RegExp("^[a-zA-Z\-]+$");
    var LegalChars = new RegExp("^[a-zA-Z\-\u0590-\u05FF ]+$");


    function isStrContainHebrew (content){

        isHebrew = false;

        for (var i = 0; i < content.length; i++)
        {

            var charTest = content.charCodeAt(i);
            if ((charTest > 0x590) && (charTest < 0x5FF)){
                console.log("charTest", charTest);
                isHebrew = true;
                break;
            }
        }

        // var isHebrew = HebrewChars.test(content);


        return isHebrew;


    }



};