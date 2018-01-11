var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');
var utils = require('../common/utils');

/* 微信登陆 */
router.get('/wx_login', function(req,res, next){

    //console.log("oauth - login")
    // 第一步：用户同意授权，获取code
    var router = 'get_wx_access_token';
    // 这是编码后的地址
    var return_uri = 'http%3a%2f%2fm.paper-go.com%2foauth%2fget_wx_access_token';
    if(!utils.isEmpty(req.query.dev_code)){
        return_uri = return_uri + '%3fdev_code='+req.query.dev_code;
    }
    var scope = 'snsapi_userinfo';
    //var scope = 'snsapi_base';
    var uri = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+config.wechat.appID+'&redirect_uri='+return_uri+'&response_type=code&scope='+scope+'&state=STATE#wechat_redirect'
    //console.log('reUri : ' + uri);
    res.redirect(uri);
});

router.get('/get_wx_access_token',async function(req,res, next){
    //console.log("get_wx_access_token");
    //console.log("code_return: "+req.query.code);
    //console.log("dev_code:"+ req.query.dev_code);
    // 第二步：通过code换取网页授权access_token
    try{
        var code = req.query.code;
        var resultBody = await utils.request_get({
            url:'https://api.weixin.qq.com/sns/oauth2/access_token?appid='+config.wechat.appID+'&secret='+config.wechat.appSecret+'&code='+code+'&grant_type=authorization_code'
        });
        var data = JSON.parse(resultBody);
        var access_token = data.access_token;
        var openid = data.openid;
        resultBody = await utils.request_get({
            url:'https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN'
        });
        var wxUserinfo = JSON.parse(resultBody);
        console.log('获取微信信息成功！');

        var params = {
            "nick_name" : wxUserinfo.nickname,
            "open_id" : openid
        };
        resultBody = await  utils.request_get({ url:config.api_prefix + config.api_url.user+"/" + openid });
        console.dir(resultBody);
        if(resultBody == "null"){
            await utils.request_post({ url:config.api_prefix + config.api_url.user ,form : params});
            resultBody = await  utils.request_get({ url:config.api_prefix + config.api_url.user+"/" + openid });
        }
        var userinfo = JSON.parse(resultBody);
        //没有设备code，跳转至个人中心
        if(utils.isEmpty(req.query.dev_code)){
            return res.render('account', {
                nickname: wxUserinfo.nickname ,
                head_img : wxUserinfo.headimgurl,
                balance : userinfo.balance,
                score : userinfo.score,
                open_id : openid
            });
        }
        resultBody = await  utils.request_get({ url:config.api_prefix + config.api_url.products});
        console.dir(resultBody);
        var products = JSON.parse(resultBody);
        res.render('index', {
            nickname: wxUserinfo.nickname ,
            head_img : wxUserinfo.headimgurl,
            balance : userinfo.balance,
            score : userinfo.score,
            open_id : openid ,
            dev_code: req.query.dev_code,
            products:products
        });
    } catch (err) {
        res.render('error', {error: err});
    }

});


module.exports = router;
