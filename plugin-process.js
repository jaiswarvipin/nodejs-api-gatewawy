/***********************************************************************/
/*Purpose   : This Module Load hte default plugins and Request for  API
/*Created By: Jaiswar Vipin Kumar R.
/*Chaneg Log
/*-----------------------------------------------------------------------
/*Publish Date      by Whome                    Changes Description
/*-----------------------------------------------------------------------
/*14-03-2020        Jaisawr Vipin Kumar R.      Created
/*************************************************************************/
class pluginProcess{
    /***************************************************************************/
    /*Purpose   : Default method.
    /*Input     : None.
    /*Response  : None.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    constructor(){
        /* Variable initilization */
        this.authProcessRef    = require('apigateway_auth_process');
        this.authProcessObj    = new this.authProcessRef();
        this.headerProcessRef  = require('apigateway_header_process');
        this.headerProcessObj  = new this.headerProcessRef();
        this.requestProcessRef  = require('apigateway_request_process');
        this.requestProcessObj  = new this.requestProcessRef();
    }

    /***********************************************************************/
    /*Purpose   : Init the Auth.
    /*Inputs    : pStrConfigCollection : API Config Collection,
                : pStrHeaderCollection :: Header Collection.
    /*Returns   : Return the Authrization Status: Description.
    /*Created By: Jaiswar Vipin Kumar R.
    /***********************************************************************/
    doAuthInit(pStrConfigCollection, pStrHeaderCollection, callback){
        console.log('doAuthentication Initi');
        /* Perform the Auth */
        this.authProcessObj.doAuthentication(pStrConfigCollection, pStrHeaderCollection, (pResponse)=>{
            return callback(pResponse);
        });
    }

    /***********************************************************************/
    /*Purpose   : Init the Request Header.
    /*Inputs    : pStrConfigCollection : API Config Collection,
                : pStrHeaderCollection :: Header Collection.
    /*Returns   : Return the Processed header : JSON.
    /*Created By: Jaiswar Vipin Kumar R.
    /***********************************************************************/
    doRequestHeaderInit(pStrConfigCollection, pStrHeaderCollection, callback){
        console.log('doRequestHeader Initi');
        /* Perform the Auth */
        this.headerProcessObj.doProcessHeader(pStrConfigCollection, pStrHeaderCollection, (pResponse)=>{
            return callback(pResponse);
        });
    }

    /***********************************************************************/
    /*Purpose   : Init the Request body.
    /*Inputs    : pStrConfigCollection : API Config Collection,
                : pStrBodyCollection :: Request Body Collection.
    /*Returns   : Return the Processed request body : JSON.
    /*Created By: Jaiswar Vipin Kumar R.
    /***********************************************************************/
    doRequestBodyInit(pStrConfigCollection, pStrBodyCollection, callback){
        console.log('doRequestHeader Initi');
        /* Perform the Request Body */
        this.requestProcessObj.doProcessRequestBody(pStrConfigCollection, pStrBodyCollection, (pResponse)=>{
            return callback(pResponse);
        });
    }
}

module.exports = pluginProcess;