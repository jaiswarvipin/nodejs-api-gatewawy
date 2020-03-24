/* Web Socket Lib  Reference */
const WebSocket = require('ws');
const responseObj = require('./response-code');

/* Varaible Declaration */
var webSockets = {};
var strDefaultReply = "~NA~";
var strENV          = "productio";


/* Creaing the web socket server */
const wss = new WebSocket.Server({
  port: 8096,
  perMessageDeflate: false
});

/* Estiblishing the web socket connection */
wss.on('connection', function connection(ws, req) {
    /* Geneting the session key */
    var strWeSessionID     = getRandomInt(30);
    /* Event registing on message receival from Client */
    ws.on('message', function(message) {
        /* Parsing the message */
        var messageObj = JSON.parse(message);
        //messageObj.headers =  mergeJSON(messageObj.headers,{"remoteAddr":req.connection.remoteAddr});
        echoLog('received from ' + strWeSessionID + ': ' + message);
        /* Verifying and validating the session ID */
        if(messageObj.headers.wsSessionID){
            /* Assiging the session ID, if passed by the session */
            strWeSessionID = messageObj.headers.wsSessionID;
        }else{
            /* Creating the Web Socket Object (Proto type) for respactive session */
            webSockets[strWeSessionID] = ws;
            /* Setting the value */
            messageObj.headers.wsSessionID  = strWeSessionID;
        }

        /* Geting the Web socket Object Refrence */
        var toUserWebSocket = webSockets[strWeSessionID];
        
        /* Authenticating the request header */
        var strHeaderParsingResObj = requestAuthencation(messageObj);

        /* Checking the header parsing response */
        if(strHeaderParsingResObj.status == responseObj.SUCCESS){
            /* Default ACK response to the client */
            var strRetunObj = {
                "wsSessionID":strWeSessionID,
                "status":responseObj.SUCCESS,
                "data":{
                    "connection":"ACK"
                }
            }            
        }else{
            /* Default ACK response to the client */
            var strRetunObj = {
                "wsSessionID":strWeSessionID,
                "status":strHeaderParsingResObj.status,
                "data":{
                    "connection":strHeaderParsingResObj.description
                }
            }
        }

        echoLog('sent to ' + strWeSessionID + ': ' + JSON.stringify(strRetunObj))
        /* Sending the ACK messag to the client */
        toUserWebSocket.send(JSON.stringify(strRetunObj));

        /* Checking the header parsing response */
        if(strHeaderParsingResObj.status == responseObj.SUCCESS){
            getMessageFromServceBus();

            /* Routnig the reqeust */
            setRouting(toUserWebSocket, strWeSessionID, messageObj);
        }
    });

    ws.on('brodcast',function(message){
        /* Geting the Web socket Object Refrence */
        var clientWS = webSockets[strWeSessionID];
        console.log("Message Brodcasting to the :"+strWeSessionID);
        clientWS.send(message);
    });
   
    /* Registing the web socket conection event */
    ws.on('close', function () {
        /* if session found then do needful */
        if(strWeSessionID){
            /* Removing the protypying object from collection */
            delete webSockets[strWeSessionID];
            echoLog('deleted: ' + strWeSessionID)
        }
    });

    setInterval(()=>
        boardcastMessage(ws),
    5000);
});

function boardcastMessage(ws){
    var strDestinationPort = [8093, 8094, 8095];
    var intIndex = Math.floor(Math.random() * strDestinationPort.length);
    
    ws.emit("brodcast",
                    JSON.stringify(
                        {
                            "headers":{
                                    "Authorization":"Bearer TOKEN",
                                    "oAuthToken": "daf0-VP31XxMn_"+strDestinationPort[intIndex],
                                    "wsSessionID": "",
                                    "operation": "offer",
                                    "source": "expria",
                                    "Upgrade": "websocket"
                                }, 
                            "messageBody":{
                                "id":"123455"
                            }
                        }
                    )
    );
    
}

/***************************************************************************/
/*Purpose   : Sending Mesage to the client.
/*Input     : pHeader :: Request hender of the client,
            : pMessage :: Respone Message body,
/*Response  : TRUE : If client is avaliable/ FALASE: Client is not avaliable
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function sendMessage(pHeader, pMessage, callBack) {
    if(!webSockets[pHeader.wsSessionID]){
        return callBack(false);
    }else{
        pWSSenderObject = webSockets[pHeader.wsSessionID];
        pWSSenderObject.send(pMessage);
        return callBack(true);
    }
}

/***************************************************************************/
/*Purpose   : Store the undelivered message.
/*Input     : pStrMessage :: Message,
            : pRequstParam :: Message meader object.
/*Response  : None.
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function setUnDeliveredMessage(pStrMessage, pRequstParam) {
    echoLog("Data Request raised for - Not delivery");
    /* settign the request */
    mysqlSQLConnectgionObj.setData(
        {
            "wsSessionID":pRequstParam.wsSessionID,
            "operationCode":pRequstParam.operation,
            "OAuthSession":pRequstParam.oAuthToken,
            "isReqeust":0,
            "serviceBusMessageID":"AAAA",
            "responseBody": JSON.stringify(pStrMessage),
            "isUnDelivered":true
        },function(insertID){
            echoLog("Data Request raised for - Not delivery Response: "+insertID);
        }
    );
}

/***************************************************************************/
/*Purpose   : Generating the Rendom alphanumeric string of requested length.
/*Input     : pIntLength :: Length of the string.
/*Response  : A alphanumeric string of requested length.
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function getRandomInt(pIntLength) {
    /* Varaible initilization */
    var strResult           = '';
    var strCharacters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    /* Looping */
    for ( var intCounter = 0; intCounter < pIntLength; intCounter++ ) {
        /* Creating the random character */
        strResult += strCharacters.charAt(Math.floor(Math.random() * strCharacters.length));
    }
    /* return the random string */
    return strResult;
}

/***************************************************************************/
/*Purpose   : Performing the routing based on teh request.
/*Input     : pWsSessionObj :: Respactive client Web Socket Object,
            : pStrWeSessionID :: Respactive client conenction session ID,
            : pStrMessageObj :: Message Object.
/*Response  : Retrun the API response.
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function setRouting(pWsSessionObj, pStrWeSessionID, pStrMessageObj){
    /* Variable initilization */
    var pResponseObj = "";
    var pStrHeaderObj = pStrMessageObj.headers;

    /* Case selection */
    switch(pStrHeaderObj.operation){
        case "offer":
            pResponseObj = {
                "wsSessionID":pStrWeSessionID,
                "data":{
                    "message":"Reply of the API",
                    "offer": {
                        "name":"XXXXX",
                        "valid":"XXXX"
                    }
                }
            }
            break;
    }

    this.strRoute = pStrHeaderObj.operation;

    if(!pStrHeaderObj.operation){
        this.strRoute   = "/";
    }

    /* setting header */
    //isAnyDeliveryPending(pStrHeaderObj,pWsSessionObj);
    
    /* if not conncetion requst */
    if(this.strRoute != '/'){
        /* putting message into the service bus */
        /*putMessageInServceBus(pStrHeaderObj,function(pResonseCode){
            console.log(pResonseCode);
        });*/
        echoLog(pStrHeaderObj);
        putMessageInServceBus(pStrHeaderObj, pStrMessageObj.messageBody);
    }

    /* if return object is not epty then do needful */
    if(pResponseObj!=''){
        /* Sending Message after 5 seconds */
        setTimeout(function(){
            setRequestMetaData(pStrHeaderObj,pResponseObj,pWsSessionObj, function(pRecordKey){
                sendMessage(pStrHeaderObj,JSON.stringify(pResponseObj),function(pIsMessageDelivered){
                    if(pIsMessageDelivered){
                        //mysqlSQLConnectgionObj.setDeliveyUpdate(pRecordKey);
                        echoLog("Message is delivered.");
                    }else{
                        setUnDeliveredMessage(pResponseObj, pStrHeaderObj);
                        echoLog("Message is not delivered.");
                    }
                });
            });
        },5000);
//        pWsSessionObj.send(JSON.stringify(pResponseObj));
    }
}

/***************************************************************************/
/*Purpose   : Parsing the reqeust header.
/*Input     : pRequstParam :: contains input request header
/*Response  : Header verification. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function requestAuthencation(pRequstParam){
    /* Getting the header object  */
    var strRequestHeaderObj = pRequstParam.headers;

    echoLog("Request Header:");
    echoLog(strRequestHeaderObj);

    /* if header object is not found then do needful */
    if(!strRequestHeaderObj){
        /* Setting the message body */
        return({status:responseObj.UNAUTHORIZED,"description":"Header is missing"});
    }

    /* Checking for Authorization header attributes */
    if(!strRequestHeaderObj.Authorization){
        /* Setting the message body */
        return({status:responseObj.UNAUTHORIZED,"description":"Authrization Header is missing or invalid"});
    }

    /* Checking for Authorization header attributes */
    if(!strRequestHeaderObj.oAuthToken){
        /* Setting the message body */
        return({status:responseObj.UNAUTHORIZED,"description":"OAuth Header is missing or invalid"});
    }

    /* Checking for Source header attributes */
    if(!strRequestHeaderObj.source){
        /* Setting the message body */
        return({status:responseObj.BADGATEWAY,"description":"Source information is missing or invalid"});
    }

    /* Checking for Operation header attributes */
    if(!strRequestHeaderObj.operation){
        /* Setting the message body */
        return({status:responseObj.UNAUTHORIZED,"description":"Operation Endpoint is missing or invalid"});
    }

    /* setting header */
    //setRequestMetaData(strRequestHeaderObj, "", "", function(pResponseObj){});
    
    /* return the defaul error message */
    return ({status:responseObj.SUCCESS});
}

/***************************************************************************/
/*Purpose   : Set the Request.
/*Input     : pRequstParam :: contains input request header,
            : pWebSocketObjRef :: Client Web Socket refrence
/*Response  : None. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function isAnyDeliveryPending(pRequstParam, pWebSocketObjRef){
    getRequestMetaData(
        {
            "oAuthToken": pRequstParam.oAuthToken,
            "serviceBusMessageID": "",
            "isUnDelivered":true,
        }
    ,function(pStrResultSet){
        echoLog(pStrResultSet);
        if(pStrResultSet){
            echoLog(pStrResultSet);
            sendMessage(pRequstParam, pStrResultSet,function(isDelivered){
                if(isDelivered){
                    mysqlSQLConnectgionObj.setDeliveyUpdate(pRequstParam.oAuthToken);
                }
            });
        }
    });
}

/***************************************************************************/
/*Purpose   : Set the Request.
/*Input     : pRequstParam :: contains input request header,
            : pResponseBody :: Response Body,
            : pWebSockeObject :: websocket object
/*Response  : None. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function setRequestMetaData(pRequstParam, pResponseBody, pWebSockeObject, callBcak){
    /*mongoConnectionObj.setRecords({
        "wsSessionID":pRequstParam.wsSessionID,
        "operationCode":pRequstParam.operation,
        "reqeustHeader":JSON.stringify(pRequstParam),
        "serviceBusMessageID":"AAAA"
    });*/

    var isHeaderReuqets = 1;
    if(pResponseBody != ""){
        isHeaderReuqets = 0;
    }

    /* settign the request
    mysqlSQLConnectgionObj.setData(
                                    {
                                        "wsSessionID":pRequstParam.wsSessionID,
                                        "operationCode":pRequstParam.operation,
                                        "OAuthSession":pRequstParam.oAuthToken,
                                        "isReqeust":isHeaderReuqets,
                                        "serviceBusMessageID":"AAAA",
                                        "responseBody": JSON.stringify(pResponseBody),
                                        "wsObject":JSON.stringify(pWebSockeObject),
                                        "isUnDelivered":false
                                    },function(pInsertKey){
                                        return callBcak(pInsertKey);
                                    }
                                ); */
}

/***************************************************************************/
/*Purpose   : Get the Request.
/*Input     : pRequstParam :: contains input request header
/*Response  : Token code. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function getRequestMetaData(pRequstParam, callBcak){
    /* settign the request */
    mysqlSQLConnectgionObj.getData(
                                    {
                                        "OAuthSession": pRequstParam.oAuthToken,
                                        "serviceBusMessageID": pRequstParam.serviceBusMessageID,
                                        "isUnDelivered":pRequstParam.isUnDelivered,
                                    },function(pStrResultSet){
                                        return callBcak(JSON.stringify(pStrResultSet));
                                    }
                                );

}

/***************************************************************************/
/*Purpose   : Putting mesasge in the service bus.
/*Input     : pStrReqeustHeader :: Requst header,
            : pStrReqeustBody :: Reqeust body
/*Response  : None. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function putMessageInServceBus(pStrReqeustHeader, pStrReqeustBody){
    echoLog("putMessageInServceBus");
    echoLog(pStrReqeustBody);
    //azServiceBusobj.sendMessage(pStrReqeustHeader.operation, pStrReqeustBody.operation+"_subscriber_1", pStrReqeustHeader.wsSessionID, pStrReqeustBody)
//    azServiceBusobj.setTopic(pStrReqeustBody.operation);
    //azServiceBusobj.setTopicSubscriptions(pStrReqeustBody.operation, pStrReqeustBody.operation+"_subscriber_1");
    //serviceBusMessageObj.dataSend(pStrReqeustBody);
}

/***************************************************************************/
/*Purpose   : Get mesasge from the service bus.
/*Input     : None.
/*Response  : None. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function getMessageFromServceBus(){
    //serviceBusMessageObj.dataPolling();
}

/***************************************************************************/
/*Purpose   : Displaying the message to the server side.
/*Input     : pStrMessage :: Message body
/*Response  : None. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function echoLog(pStrMessage){
    if(strENV != 'production'){
        console.log(pStrMessage);
    }
}

console.log("Node Web-socket Brodcaster Server is running in 8096");