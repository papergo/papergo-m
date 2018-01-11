var utils = {};  
var sha1 = require('sha1'); 
var request = require('request');  
var redis = require("redis");
var queryString = require('querystring');
var crypto = require('crypto');    
var client = redis.createClient();
var config = require('../config/config');

client.on("error", function (err) {    
  console.log("Redis Error :" , err);    
});    
    
client.on('connect', function(){    
  console.log('Redis连接成功.');    
})  
  
//检查微信签名认证中间件  
utils.sign = function (config){  
    return function(req, res, next){  
        config = config || {};  
        var q = req.query;  
      var token = config.wechat.token;  
      var signature = q.signature; //微信加密签名  
        var nonce = q.nonce; //随机数  
        var timestamp = q.timestamp; //时间戳  
        var echostr = q.echostr; //随机字符串  
        /* 
            1）将token、timestamp、nonce三个参数进行字典序排序 
            2）将三个参数字符串拼接成一个字符串进行sha1加密 
            3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信 
        */
        console.log("Connected to SSSSSS!");  
        var str = [token, timestamp, nonce].sort().join('');  
        var sha = sha1(str);  
        if (req.method == 'GET') {  
  
            if (sha == signature) {  
                res.send(echostr+'')  
            }else{  
                res.send('err');  
            }  
        }  
        else if(req.method == 'POST'){  
            if (sha != signature) {  
                return;  
            }  
            next();  
        }  
    }
};  

utils.paySign = function(signParams){
     var keys = Object.keys(signParams);
        keys = keys.sort();
        var newArgs = {};
        keys.forEach(function (val, key) {
            if (signParams[val]){
                newArgs[val] = signParams[val];
            }
        })
        var string = queryString.stringify(newArgs)+'&key='+config.pay.partnerKey;
        console.log('pay Sign string : ' + queryString.unescape(string)); 
        // 生成签名
        return crypto.createHash('md5').update(queryString.unescape(string), 'utf8').digest("hex").toUpperCase();
};

/**  
 *  * 添加string类型的数据  
 *   * @param key 键  
 *    * @params value 值   
 *     * @params expire (过期时间,单位秒;可为空，为空表示不过期)  
 *      */    
utils.set = function(key, value, expire){    
  
    return new Promise(function(resolve, reject){  
    
    client.set(key, value, function(err, result){    
    
      if (err) {    
        console.log(err);    
        reject(err);  
        return;    
      }    
  
      if (!isNaN(expire) && expire > 0) {    
        client.expire(key, parseInt(expire));    
      }    
  
      resolve(result);   
    })   
  })   
};    
    
/**  
 *  * 查询string类型的数据  
 *   * @param key 键  
 *    */    
utils.get = function(key){    
  
    return new Promise(function(resolve, reject){  
    
    client.get(key, function(err,result){    
    
      if (err) {    
        console.log(err);    
        reject(err);    
        return;    
      }    
  
      resolve(result);    
    });   
  })   
};

//Promise化request  
utils.request = function(opts){  
    opts = opts || {};  
    return new Promise(function(resolve, reject){  
        request(opts,function(error, response, body){  
  
            if (error) {  
                return reject(error);  
            }  
            resolve(body);  
        })  
          
    })
};
//Promise化request
utils.request_get = function(opts){
    opts = opts || {};
    return new Promise(function(resolve, reject){
        request.get(opts,function(error, response, body){

            if (error) {
                return reject(error);
            }
            resolve(body);
        })

    })

};
//Promise化request
utils.request_post = function(opts){
    opts = opts || {};
    return new Promise(function(resolve, reject){
        request.post(opts,function(error, response, body){

            if (error) {
                return reject(error);
            }
            resolve(body);
        })

    })

};

//生成随机字符串
utils.generateRandom = function(len,radix){
    radix = radix ? 10 : 36;
    var rdmString = "";
    for (; rdmString.length < len; rdmString += Math.random().toString(radix).substr(2));
    return rdmString.substr(0, len);
};


utils.isEmpty = function(obj){
    if(typeof (obj) == "undefined")
        return true;
    else
        return false;
};


module.exports = utils;
