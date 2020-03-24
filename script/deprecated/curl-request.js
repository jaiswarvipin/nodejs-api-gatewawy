var curl = require('curlrequest');

var options = {
    url:'http://localhost:8090/tokenVerification/',
    method:'post',
    headers:{ 
                'content-type': 'application/x-www-form-urlencoded',
                authorization: 'Kagsfw8957349shgd!893453jdfhg8',
                'miniorange-content-type': 'application/x-www-form-urlencoded',
                'miniorange-timestamp': '20200314000000',
                'miniorange-customer-key': 'AJNSJHW3849S3XW',
                'miniorange-authorization': 'Kagsfw8957349shgd!893453jdfhg8',
                'miniorange-txid': 'fc727646-7c91-11e5-883e-0e2fb063e0f9',
                'miniorange-token': '123456',
                'user-agent': 'PostmanRuntime/7.23.0',
                accept: '*/*',
                'cache-control': 'no-cache',
                'postman-token': 'e16e2e3c-20ab-40d3-b29d-b05dd0685858',
                host: 'localhost:3000',
                'accept-encoding': 'gzip, deflate, br',
                'content-length': '75',
                connection: 'keep-alive' 
    },
    data:{
        'token':'12344444'
    },
    timeout:5000
}
console.log(options);
curl.request(options, function(er, respone){
    //console.log(respone);
    console.log(er);
});