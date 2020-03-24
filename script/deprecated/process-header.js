/***********************************************************************/
/*Purpose   : This Module Process the  Header of each API Request call
/*Created By: Jaiswar Vipin Kumar R.
/*Chaneg Log
/*-----------------------------------------------------------------------
/*Publish Date      by Whome                    Changes Description
/*-----------------------------------------------------------------------
/*14-03-2020        Jaisawr Vipin Kumar R.      Created
/*************************************************************************/
class processAuth{
    /***************************************************************************/
    /*Purpose   : Default method.
    /*Input     : None.
    /*Response  : None.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    constructor(){
        /* Variable initilization */
        this.headerProcessRef    = require('apigatewayHeaderProcess');
        this.headerProcessObj    = new this.headerProcessRef();
    }

    /***********************************************************************/
    /*Purpose   : Init the Request header management.
    /*Inputs    : pStrRequestHeaderCollection : Config Collection,
                : pStrHeaderCollection :: Header Collection.
    /*Returns   : Return the Authrization Status: Description.
    /*Created By: Jaiswar Vipin Kumar R.
    /***********************************************************************/
    doAuthInit(pStrRequestHeaderCollection, pStrHeaderCollection, callback){
        console.log('doAuthentication Initi');
        /* Perform the Auth */
        this.authProcessObj.doAuthentication(pStrAuthCollection, pStrHeaderCollection, (pResponse)=>{
            return callback(pResponse);
        });
    }
}

module.exports = processAuth;