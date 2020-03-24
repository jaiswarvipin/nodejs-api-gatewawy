const httpServer    = require('http');
const express       = require('express');
const bodyParser    = require("body-parser");
const responseObj = require('./response-code');
const mysqlRef      = require('./mysql-db');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send(''))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

/* Setting the DB connection object */
var mysqlSQLConnectgionObj = new mysqlRef();

/***********************************************************************/
/*Purpose   : Getting Routing details.
/*Inputs    : pStrSlug : String
/*Returns   : Up Stream URL.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function getRouterDetails(pStrSlug){
    /* Variable intilization */
    var strDefaultResponseArr  = [];

    /* Checking for slug validation */
    if(pStrSlug == ""){
        return strDefaultResponseArr;
    }

    /* Database Connection */
    mysqlSQLConnectgionObj.getRouteDetails(pStrSlug,function(pStrResponse){
        /* Checking result set length */
        if(pStrResponse.length > 0){
            /* Return the up-stream url */
            return (pStrResponse);
        }else{
            /* Return default response */
            return strDefaultResponseArr;
        }
    });
}

/***********************************************************************/
/*Purpose   : Getting Routing details.
/*Inputs    : pStrSlug : String
/*Returns   : Up Stream URL.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function getOperation(pStrUpStreamURLArr){
    /* checking for upstream url */
    if(pStrUpStreamURLArr.length == 0){
        
    }else{
    }
}

/***********************************************************************/
/*Purpose   : Getting Routing details.
/*Inputs    : pStrSlug : String
/*Returns   : Up Stream URL.
/*Created By: Jaiswar Vipin Kumar R.
/***********************************************************************/
function postOperation(pStrUpStreamURLArr){
    /* checking for upstream url */
    if(pStrUpStreamURLArr.length == 0){

    }else{

    }

    app.get()
}

const strUpStreamURLArr = getRouterDetails();

/*if(strUpStreamURLArr.length == 0){

}else{

}*/