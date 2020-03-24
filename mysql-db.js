/*************************************************************************/
/*Purpose   : Service Bus realetd opetional management.
/*Created By: Jaiswar Vipin Kumar R.
/*Chaneg Log
/*-----------------------------------------------------------------------
/*Publish Date      by Whome                    Changes Description
/*-----------------------------------------------------------------------
/*14-03-2020        Jaisawr Vipin Kumar R.      Created
/*************************************************************************/
class mysqlDataSet{
    /***************************************************************************/
    /*Purpose   : Default method.
    /*Input     : None.
    /*Response  : None.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    constructor(){
        this.mysqlObj           = require('mysql');
        this.connectionPoolObj  = this.mysqlObj.createPool(
                                                    {
                                                        connectionLimit : 100000,
                                                        host            : 'localhost',
                                                        user            : 'root',
                                                        password        : '',
                                                        database        : 'api-gateway'
                                                    }
                                                );
    }
    
    /***************************************************************************/
    /*Purpose   : Open DB Connection.
    /*Input     : None.
    /*Response  : None.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    openConnection(){
        this.connectionObj.connect();
    }

    /***************************************************************************/
    /*Purpose   : Close the DB Connection.
    /*Input     : None.
    /*Response  : None.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    closeClonnection(){
        this.connectionObj,end();
    }

    /***************************************************************************/
    /*Purpose   : Insert data in into respactive .
    /*Input     : None.
    /*Response  : None.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    setData(pDataStructure,callback){
        return callback(1);
        /* Setting default schema name */
        var strTableName = "trans_undelivred_message";
        /* Base on the delivery flag update the schema name */
        if(!pDataStructure.isUnDelivered){
            strTableName            = "trans_request_metadata";
        }
        /* DML Statemetn with parameters */
        var strQuery            = " insert into "+strTableName+" (session_code, record_date, operation, messageBody, serviceBusMessageID, oauthSession, isReqeust, wsObject) value (?,?,?,?,?,?,?,?) ";
        this.intDateTime        = this.getTimeStatmp();
        this.strSessionCode     = pDataStructure.wsSessionID;
        this.strOperation       = pDataStructure.operationCode;
        this.strRequestHeader   = pDataStructure.responseBody;
        this.srtSBMessageID     = pDataStructure.serviceBusMessageID;
        this.strOAuthSession    = pDataStructure.OAuthSession;
        this.isReqeust          = pDataStructure.isReqeust;
        this.wsObject           = (pDataStructure.wsObject)?pDataStructure.wsObject:"";
        
        /* Performaing the DML operation */
        this.connectionPoolObj.query(
                {
                    sql:strQuery,
                    values:[this.strSessionCode, this.intDateTime, this.strOperation, this.strRequestHeader, this.srtSBMessageID, this.strOAuthSession, this.isReqeust, this.wsObject]
                }, 
                function(error, results, fields){
                    //this.connectionPoolObj.release();
                    if(error) {
                        console.log(error.description);
                        throw error;
                    }
                    return callback(results.insertId);
                }
            );
    }

    /***************************************************************************/
    /*Purpose   : Get the data from respactive schema.
    /*Input     : pDataStructure :: Filter Attribute list.
    /*Response  : Record sets in JSON format.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    getData(pDataStructure, callback){
        return callback(true);
        var strFilterParamValue = "";
        var strFilterParamKey   = "";
        this.resultSet          = {};
        /* Setting default schema name */
        var strTableName        = "trans_undelivred_message";
        /* Base on the delivery flag update the schema name */
        if(!pDataStructure.isUnDelivered){
            strTableName         = "trans_request_metadata";
        }
        
        if(pDataStructure.OAuthSession){
            strFilterParamKey       = "oauthSession";
            strFilterParamValue     = pDataStructure.OAuthSession;
        }else if(pDataStructure.OAuthSession){
            strFilterParamKey       = "session_code";
            strFilterParamValue     = pDataStructure.serviceBusMessageID;
        }

        var strQuery                = "select * from "+strTableName+" where "+strFilterParamKey+" = ?  and isReqeust = 0";
        
        this.connectionPoolObj.query(
            {
                sql: strQuery,
                values:[strFilterParamValue]
            },
            function(error, results, fields){
            //this.connectionPoolObj.release();
            if(error) throw error;
            return callback(results);
        });
    }

    setDeliveyUpdate(pKeyIndex){
        return true;
        var strColumnName       = "";
        strColumnName           = "id";
        if(isNaN(pKeyIndex)){
            strColumnName       = "oauthSession";
        }

        var strQuery            = "update trans_request_metadata set isDelivered = 1  where "+strColumnName+" = ?";
        
        this.connectionPoolObj.query(
            {
                sql: strQuery,
                values:[pKeyIndex]
            },
            function(error, results, fields){
            //this.connectionPoolObj.release();
            if(error) throw error;
        });
    }

    getTimeStatmp(){
        var dateObject = new Date();
        let intDate = ("0" + dateObject.getDate()).slice(-2);
        let intMonth = ("0" + (dateObject.getMonth() + 1)).slice(-2);
        let intYear = dateObject.getFullYear();
        let intHours = dateObject.getHours();
        let intMinutes = dateObject.getMinutes();
        let intSeconds = dateObject.getSeconds();

        return intYear+intMonth+intDate+intHours+intSeconds;
    }

    /***************************************************************************/
    /*Purpose   : get the API routes details.
    /*Input     : pStrRoutes :: Routes.
    /*Response  : Routes Details.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    getRouteDetails(pStrRoutes, callback){
        //var strQuery                = "SELECT master_api.id as api_code, master_api.slug, master_api.operation_type, master_api.upstream_url, master_policy.auth_process,master_policy.header_process,master_policy.request_process,master_policy.response_process,master_policy.default_message FROM master_api inner join trans_api_policy on master_api.id = trans_api_policy.api_code inner join master_policy on master_policy.id = trans_api_policy.policy_code WHERE master_api.deleted = 0 and trans_api_policy.deleted = 0 and master_policy.deleted = 0 and master_api.slug = ?";
		
		var strQuery                = "select `api_definition_3`.`id` as api_code, `api_definition_3`.`operation-name` as slug, `api_definition_3`.`operation-type` as operation_type, `api_collection_3`.`service-url` as upstream_url, `api_collection_3`.`policy` as policy_code from `api_definition_3` inner join `api_collection_3` on `api_definition_3`.`api_collection_code` = `api_collection_3`.`id` where `api_definition_3`.`deleted` = 0 and `api_collection_3`.`deleted` = 0 and `api_definition_3`.`operation-name`= ?";
        
        this.connectionPoolObj.query(
            {
                sql: strQuery,
                values:[pStrRoutes]
            },
            function(error, results, fields){
            //this.connectionPoolObj.release();
            if(error) throw error;
            return callback(results);
        });
    }

    /***************************************************************************/
    /*Purpose   : Get Auth Configuration Details.
    /*Input     : pIntApiCode :: API Code.
    /*Response  : Auth Config.
    /*Created By: Jaiswar Vipin Kumar R.
    /***************************************************************************/
    getAuthConfig(pIntApiCode, callback){
		/* Variable initializtion */
		var strQuery                = "SELECT `policy_3`.`request-authentication-` as `auth_operation_type`, `policy_3`.`request-header` as `header_config`, `policy_3`.`request-body-` as `request_config`,`policy_3`.`response` as `response_config`,`policy_3`.`auth-type-json-config` as `auth_config`,`policy_3`.`moc-response` as `default_message` FROM `policy_3` where `policy_3`.`deleted` = 0 and `policy_3`.`id` in(?)";
        
        this.connectionPoolObj.query(
            {
                sql: strQuery,
                values:[pIntApiCode]
            },
            function(error, results, fields){
            //this.connectionPoolObj.release();
            if(error) throw error;
            return callback(results);
        });
    }
}

module.exports = mysqlDataSet;