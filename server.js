const httpServer        = require('http');
const webSocketServer 	= require('ws');
const urlObj            = require('url');
const upStreamObj       = require("request");
const queryStringObj    = require("querystring");
const httpBodyParser    = require('body-parser')
const responseObj       = require('./response-code');
const mysqlRef          = require('./mysql-db');
const pluginProcessRef  = require('./plugin-process');
const intPort           = 3000;
const intDefaultTimeOut = 10000;
const strKeyOperation	= {'basic':1,'oauth-2':2,'mini-orange':3,'not required':4,'post':5,'get':6};

/* Varaible Declaration */
var webSockets 			= {};
var strDefaultReply 	= "~NA~";
var strENV          	= "productio";

/* Setting the DB connection object */
/* https://github.com/websockets/ws */
var mysqlSQLConnectgionObj  	= new mysqlRef();
var pluginProcessObj          	= new pluginProcessRef();
var webSocketServerObj			= new webSocketServer.Server({ noServer: true });

webSocketServerObj.on('connection', function connection(ws, request, client) {
	const strQueryString    = urlObj.parse(request.url, true).query;
    const strEndPoint       = urlObj.parse(request.url, true).pathname;
	
	/* Geneting the session key */
    var strWeSessionID     = getRandomInt(30);
	/* Event registing on message receival from Client */
	ws.on('message', function message(message) {
		/* Parsing the message */
        var messageObj = JSON.parse(message);
        //messageObj.headers =  mergeJSON(messageObj.headers,{"remoteAddr":req.connection.remoteAddr});
        echo('received from ' + strWeSessionID + ': ' + message);
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
		
		processRequest(strEndPoint, messageObj, toUserWebSocket, messageObj.data, strQueryString, true, (pAPIResponse)=>{
			echo ("Final WebSocket Response");
			echo (pAPIResponse);
		});
		
		/* Sending the ACK messag to the client */
        toUserWebSocket.send(JSON.stringify(messageObj));
	});
	
	/* On Board Casting casting */
	ws.on('brodcast',function(message){
        /* Parsing the message */
        var messageObj = JSON.parse(message);
        //messageObj.headers =  mergeJSON(messageObj.headers,{"remoteAddr":req.connection.remoteAddr});
        echoLog('received from ' + strWeSessionID + ': ' + message);
    });
   
    /* Registing the web socket conection event */
    ws.on('close', function () {
        /* if session found then do needful */
        if(strWeSessionID){
            /* Removing the protypying object from collection */
            delete webSockets[strWeSessionID];
            echo('Web Seock connection deleted: ' + strWeSessionID)
        }
    });
});

httpServer.createServer((request, response) => {
	/* Set the Default Response Type */
    response.setHeader('Content-Type', 'application/json');

    const strQueryString    = urlObj.parse(request.url, true).query;
    const strEndPoint       = urlObj.parse(request.url, true).pathname;

    const { headers, method, url } = request;
	echo("Header Start");
	echo(headers);
	echo("Header Stop");
	
    let body = [];
    request.on('error', (err) => {
        response.write(err);
        response.end();
    }).on('data', (chunk) => {
        body.push(chunk);
	}).on('end', () => {
        body = Buffer.concat(body).toString();
        // BEGINNING OF NEW STUFF
        response.on('error', (err) => {
            response.write(err);
            response.end();
        });
        echo(strEndPoint);
		
		processRequest(strEndPoint, request, response, body, strQueryString, false, (pAPIResponse)=>{
			echo ("Final Response");
			echo (pAPIResponse);
		});
		
    });
}).on('upgrade', function upgrade(request, socket, head) {
		echo("New WS conenction");
		
		const pathname = urlObj.parse(request.url).pathname;
	  
		webSocketServerObj.handleUpgrade(request, socket, head, function done(ws) {
			webSocketServerObj.emit('connection', ws, request);
		});
				
}).listen(intPort);

/***************************************************************************/
/*Purpose   : Processing the request.
/*Input     : strEndPoint :: End point that nedds to be serve, 
			: request :: Client Request Object, 
			: response :: Client Response Object, 
			: body :: Reqeust Body, 
			: strQueryString :: Query String, 
			: pBlnIsWebSocket :: Is web stocket reqeust
/*Response  : API Execution Response. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function processRequest(strEndPoint, request, response, body, strQueryString, pBlnIsWebSocket, callback){
	/* Get the routs information */
	getRouterDetails(strEndPoint,function(pStrUpStreamDataSetArr){
		/* variable initilization */
		var strDefaultResponseArr  	= {'apiMetaData':[], 'apiConfig':[]};
		
		echo("Response Start");
		echo(pStrUpStreamDataSetArr);
		echo("Response Stop");
		
		/* Variable Initilization */
		const pStrAPIMetaData       = pStrUpStreamDataSetArr.apiMetaData;
		const pStrAPIConfigMetaData = pStrUpStreamDataSetArr.apiConfig;
		
		pStrAPIMetaData[0]['auth_process']		= 0;
		pStrAPIMetaData[0]['header_process']	= 0;
		pStrAPIMetaData[0]['request_process']	= 0;
		pStrAPIMetaData[0]['response_process']	= 0;
		
		/* Setting the auth operations */
		if(pStrAPIConfigMetaData[0].auth_operation_type != 4){
			/* Value overeiding */
			pStrAPIMetaData[0]['auth_process']	= 1;
		}
		/* Setting the header operations */
		if((pStrAPIConfigMetaData[0].header_config !='') && (JSON.parse(pStrAPIConfigMetaData[0].header_config))){
			/* Value overeiding */
			pStrAPIMetaData[0]['header_process']	= 1;
		}
		/* Setting the request operations */
		if((pStrAPIConfigMetaData[0].request_config!='') && (JSON.parse(pStrAPIConfigMetaData[0].request_config))){
			/* Value overeiding */
			pStrAPIMetaData[0]['request_process']	= 1;
		}
		/* Setting the respone operations */
		if((pStrAPIConfigMetaData[0].response_config !='') && (JSON.parse(pStrAPIConfigMetaData[0].response_config))){
			/* Value overeiding */
			pStrAPIMetaData[0]['response_process']	= 1;
		}
		/* Creating Upstream URL */
		if((pStrAPIMetaData[0].slug !='') && (pStrAPIMetaData[0].upstream_url !='')){
			/* Value overeiding */
			pStrAPIMetaData[0].upstream_url	= pStrAPIMetaData[0].upstream_url + pStrAPIMetaData[0].slug;
		}
		
		/* if API Routes information is not found then do needful */
		if(pStrAPIMetaData.length == 0){
			/* Not round response to Requstor */
			echoToClient(response,responseObj.NOTFOUND.status,responseObj.NOTFOUND,pBlnIsWebSocket, (pResponse)=>{
				/* Response the customer */
				return callback(pResponse);
			});
		}else{
			/* Gettign request method code */
			var intReqeustMethodCode	= (strKeyOperation[(request.method).toString().toLowerCase()])?strKeyOperation[(request.method).toString().toLowerCase()]:0;
			/* Reqeust method is not allowed response to Requstor */
			if((!pBlnIsWebSocket) && (intReqeustMethodCode != pStrAPIMetaData[0].operation_type)){
				echoToClient(response,responseObj.METHODNOTALLOWED.status,responseObj.METHODNOTALLOWED,pBlnIsWebSocket, (pResponse)=>{
					/* Response the customer */
					return callback(pResponse);
				});
			/* Chceking for defaul mesasge */
			}else if((pStrAPIConfigMetaData[0].default_message !='') && (JSON.parse(pStrAPIConfigMetaData[0].default_message))){
				/* Setting the default mesasge */
				var strDefaultMessage = JSON.parse(pStrAPIConfigMetaData[0].default_message);
				/* Reqeust method is not allowed response to Requstor */
				echoToClient(response,strDefaultMessage.statusCode,strDefaultMessage,pBlnIsWebSocket, (pResponse)=>{
					/* Response the customer */
					return callback(pResponse);
				});
			}else{
				/* if Auth reqeust is set then do needful */
				if(pStrAPIMetaData[0].auth_process == 1){
					/* Do Reqeust authrization */
					doAuth(pStrAPIConfigMetaData, request.headers, pStrAPIMetaData[0].header_process,  function(pResponseCollection){
						echo('Main Do Auth final Response');
						var strHeaderResponseObj    = JSON.parse(pResponseCollection);
						echo(strHeaderResponseObj);
						
						/* Checking for valid header */
						if(strHeaderResponseObj.authResponse){
							if(strHeaderResponseObj.authResponse.statusCode != 200){
								echoToClient(response,strHeaderResponseObj.authResponse.statusCode,strHeaderResponseObj.authResponse,pBlnIsWebSocket, (pResponse)=>{
									return callback(pResponse);
								});
							}else{
								/* Executing the up-stream end point */
								processUpstreamURL(pStrAPIMetaData, strHeaderResponseObj, body, strQueryString,pStrAPIConfigMetaData,function(pStrResponseCollelction){
									echoToClient(response,responseObj.SUCCESS.status,pStrResponseCollelction,pBlnIsWebSocket, (pResponse)=>{
										return callback(pResponse);
									});
								});
							}
						}else{
							echoToClient(response,responseObj.INTERNALSERVERERROR.status,responseObj.INTERNALSERVERERROR,pBlnIsWebSocket, (pResponse)=>{
								return callback(pResponse);
							});
						}
					});
				}else{
					echo('Wihtout Main Do Auth final Response');
					getUnAuthResonse(pStrAPIConfigMetaData, request.headers,(pResponse)=>{
						/* Executing the up-stream end point */
						processUpstreamURL(pStrAPIMetaData, pResponse, body, strQueryString,pStrAPIConfigMetaData,function(pStrResponseCollelction){
							echoToClient(response,responseObj.SUCCESS.status,pStrResponseCollelction,pBlnIsWebSocket, (pResponse)=>{
								return callback(pResponse);
							});
						});
					});
				}
			}
		}
	});
}

/***********************************************************************/
/*Purpose   : Processing Upstream URL using proxy.
/*Inputs    : pStrUpStreamDataSetCollection : up-Stream Data Collection,
            : pStrHeaders :: Reqeust Header,
            : pStrRequestBody : Reqeust body in POST case,
            : pStrQueryString :: Query String,
            : pApiConfigMetaDatConfig: Config Object
/*Returns   : Up Stream Respponse.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function processUpstreamURL(pStrUpStreamDataSetCollection, pStrHeaders, pStrRequestBody, pStrQueryString, pApiConfigMetaDatConfig, callback){
    echo('Up Stream Reqeust');
    var strBody             = pStrRequestBody;
    let strResponseBody     = [];
    var strDefaultRespone   = pStrUpStreamDataSetCollection.INTERNALSERVERERROR;
    echo(pStrHeaders);

    if(pStrUpStreamDataSetCollection[0].operation_type == 'POST'){
        strBody = queryStringObj.parse(strBody);
    }
    
    echo("Custom Request Before Processing");
    echo(strBody);

    if((pStrUpStreamDataSetCollection[0].request_process == 1) && (pStrHeaders.config.length >0 )){
        /* Processing the request body */
		doProcessRequestBody(pStrHeaders.config[0].request_config, strBody,(pStrBodyObj)=>{
            echo("New Custom Reqeust Body");
            /* Setting the New Custom Body */
            strBody             = pStrBodyObj;
        });
    }
	echo("Custom Request After Processing");
    echo(strBody);

    /* Initilizing the upstream processing strecture */
    var strUpStreamArr  = {
        url: pStrUpStreamDataSetCollection[0].upstream_url,
        method:pStrUpStreamDataSetCollection[0].operation_type,
        headers:pStrHeaders.headerReponse,
        form:strBody,
        body:strBody,
        query:pStrQueryString,
		time: true,
		timeout:10000
    }

    if(pStrUpStreamDataSetCollection[0].operation_type == 'GET'){
        delete strUpStreamArr['form'];
        delete strUpStreamArr['headers'];
    }

	echo("CURL Request");
    echo(strUpStreamArr);

    try{
        /* Calling the proxy for executing the details */
        upStreamObj(strUpStreamArr,function(error,req,body){
			/* Checking for response header */
            //if(error || (req.statusCode != 200)){
			if(error){
				/* if error code found tehn do needful */
				if(responseObj[error.code]){
					/* Set response */
					return callback(responseObj[error.code]);
				}else{
					/* Set response */
					return callback({'statusCode':error.code,'message':error.message});
				}
            }else{
                /* Set response */
                return callback(body);
            }
        });
    }catch(exception){
        return callback(strDefaultRespone);
    }
}

/***********************************************************************/
/*Purpose   : Getting Routing details.
/*Inputs    : pStrSlug : String
/*Returns   : Up Stream URL.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function getRouterDetails(pStrSlug, callback){
    /* Variable intilization */
    var strDefaultResponseArr  = {'apiMetaData':[], 'apiConfig':[]};

    /* Checking for slug validation */
    if(pStrSlug == ""){
        return callback(strDefaultResponseArr);
    }

    /* Database Connection */
    mysqlSQLConnectgionObj.getRouteDetails(pStrSlug,function(pStrResponse){
		/* Checking result set length */
        if(pStrResponse.length > 0){
            /* set api Meta Data */
            strDefaultResponseArr.apiMetaData   = pStrResponse;
            
            /* Gettign the Auth Config collection */
            getAuthConfigCollectionDetails(pStrResponse[0].policy_code,(pStrApiConfigMetaDataObj)=>{
				/* If policy details found then do neeful */
                if(pStrApiConfigMetaDataObj.length > 0){
                    /* set api config meta Data */
                    strDefaultResponseArr.apiConfig   = pStrApiConfigMetaDataObj;
                    /* Return the up-stream url */
                    return callback(strDefaultResponseArr);
                }else{
                    /* Return the up-stream url */
                    return callback(strDefaultResponseArr);
                }
            });
        }else{
            /* Return default response */
            return callback(strDefaultResponseArr);
        }
    });
}

/***********************************************************************/
/*Purpose   : Getting the Authrization details.
/*Inputs    : pIntApiCode : API identifire
/*Returns   : API Information.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function getAuthConfigCollectionDetails(pIntApiCode, callback){
    /* Variable intilization */
    var strDefaultResponseArr  = [];

    /* Checking for slug validation */
    if((pIntApiCode == 0) || (pIntApiCode == "")){
        return callback(strDefaultResponseArr);
    }

    /* Database Connection */
    mysqlSQLConnectgionObj.getAuthConfig(pIntApiCode,function(pStrResponse){
        /* Checking result set length */
        if(pStrResponse.length > 0){
            /* Return the up-stream url */
            return callback(pStrResponse);
        }else{
            /* Return default response */
            return callback(strDefaultResponseArr);
        }
    });
}

/***********************************************************************/
/*Purpose   : No Auth Auth.
/*Inputs    : pResponseArr : APi Config Response,
            : pStrHeaderCollection :: Header Collection.
/*Returns   : Return the Authrization Status: Description.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function getUnAuthResonse(pResponseArr, pStrHeaderCollection, callback){
	/* Variable intilization */
    var strFinalResponse        = {'authResponse':{},'headerReponse':pStrHeaderCollection,'config':{}};
	echo ("Wuthout Auth Request header/Body creation");
	/* set the response */
	strFinalResponse.config		= pResponseArr[0];
	
	return callback(strFinalResponse);
}

/***********************************************************************/
/*Purpose   : DO the Auth.
/*Inputs    : pIntApiCode : API Code,
            : pStrHeaderCollection :: Header Collection.
/*Returns   : Return the Authrization Status: Description.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function doAuth(pResponseArr, pStrHeaderCollection, pIntHeaderProcess,  callback){
    /* Variable intilization */
    var strDefaultResponseArr   = [];
    var intHeaderProcess        = pIntHeaderProcess;
    var strFinalResponse        = {'authResponse':{},'headerReponse':pStrHeaderCollection,'config':{}};
    
    /* Checking for slug validation */
    if((!pStrHeaderCollection) || (!pResponseArr)){
        return callback(JSON.stringify(strFinalResponse));
    }

    /* Get the auth colelction if any */
    //getAuthConfigCollectionDetails(intApiCode, function(pResponseArr){
        /* checking for any auth configuration */
        if(pResponseArr.length == 0){
            return callback(JSON.stringify(strFinalResponse));
        }else{
            /* Set the config */
            strFinalResponse.config = (pResponseArr);

            /* Performing the auth operation */
            pluginProcessObj.doAuthInit(pResponseArr, pStrHeaderCollection,function(pResponseJSON){
                /* Set the auth header respone */
                strFinalResponse.authResponse = JSON.parse(pResponseJSON);
                
                /* if custom request header process is set then do needful*/
                if(intHeaderProcess == 1){
                    /* Process Custom header process reques */
                    pluginProcessObj.doRequestHeaderInit(pResponseArr, pStrHeaderCollection,function(pResponseJSON){
                        echo(pResponseJSON);
                        return callback(JSON.stringify(strFinalResponse));
                    });
                }else{
                    return callback(JSON.stringify(strFinalResponse));
                }
            });
        }
    //});
}

/***********************************************************************/
/*Purpose   : Do the Request body Process.
/*Inputs    : pStrAPIConfig : API Request body config,
            : pStrHeaderBodyCollection :: Request Body Collection.
/*Returns   : Return the Authrization Status: Description.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function doProcessRequestBody(pStrAPIConfig, pStrHeaderBodyCollection, callback){
    /* Variable intilization */
    var strDefaultResponseArr  = [];

    /* Checking for slug validation */
    if((!pStrHeaderBodyCollection) || (!pStrAPIConfig)){
        return callback(strDefaultResponseArr);
    }

    /* Performing the reqeust body operation */
    pluginProcessObj.doRequestBodyInit(pStrAPIConfig, pStrHeaderBodyCollection,function(pResponseJSON){
        return callback(pResponseJSON);
    }); 
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

function echoToClient(pResponseObject, pStrResponseStatus, pStrMessage, pIsSocket, callback){
	var strAPIFinalResponse		= "--COMPLETED--";
	if(pIsSocket){
			try{
				echo('send init');
				//setTimeout(function(){
				pResponseObject.send(JSON.stringify({'statusCode':pStrResponseStatus,'data':pStrMessage}));
				echo('send completed');
				//},5000);
			}catch(exception){
				return callback(strAPIFinalResponse+ ' --- Message not delivered');
			}finally{
				return callback(strAPIFinalResponse);
			}
		
	}else{
		pResponseObject.writeHead(pStrResponseStatus);
		pResponseObject.write(JSON.stringify(pStrMessage));
		pResponseObject.end();
		return callback(strAPIFinalResponse);
	}
}

/***************************************************************************/
/*Purpose   : Displaying the message to the server side.
/*Input     : pStrMessage :: Message body
/*Response  : None. 
/*Created By: Jaiswar Vipin Kumar R.
/***************************************************************************/
function echo(pStrMessage){
    if(strENV != 'production'){
        console.log(pStrMessage);
    }
}