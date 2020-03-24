module.exports = Object.freeze({
    SUCCESS             : {"status":200,"description":"ok"},
    BADREQUEST          : {"status":400,"description":"Bad Request"},
    UNAUTHORIZED        : {"status":401,"description":"Unauthorized Access"},
    FORBIDDEN           : {"status":403,"description":"Forbidden"},
    NOTFOUND            : {"status":404,"description":"Resource Not Found"},
    METHODNOTALLOWED    : {"status":405,"description":"Operation/Method  Not Found"},
    NOTACCEPTABLE       : {"status":406,"description":"Reqeust Not Acceptable"},
    REQUESTTIMEOUT      : {"status":408,"description":"Reqeust Time Out"},
    CONFLICT            : {"status":409,"description":"Conflict"},
    LENGTHREQUIRED      : {"status":410,"description":"Conflict"},
    PAYLOADTOOLARGE     : {"status":413,"description":"Payload is too large"},
    URITOOLONG          : {"status":414,"description":"URL is too long"},
    INTERNALSERVERERROR : {"status":501,"description":"Internal Server Error"},
    BADGATEWAY          : {"status":502,"description":"Bad Gateway"},
    SERVICEUNAVAILABLE  : {"status":503,"description":"Service is not avaliable"},
	ECONNREFUSED		: {"status":521,"description":"The origin server has refused the connection."}
});