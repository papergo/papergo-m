var express = require('express');
var router = express.Router();
var request = require('request');
//var encode = require('urlencode');
var xml2jsparseString = require('xml2js').parseString;
var config = require('../config/config');
var utils = require('../common/utils');
/* 微信登陆 */


router.post('/to_trade', async function(req,res, next){
    try {
        var params = {
            "open_id": req.body.open_id,
            "dev_code": req.body.dev_code,
            "pro_id": req.body.pro_id,
            "amount": req.body.amount,
            "size": req.body.size,
            "score": req.body.score,
            "per": req.body.per
        };
        //console.info(JSON.stringify(params));
        //console.info(config.api_prefix + config.api_url.trade_no);
        var resultBody = await utils.request_post({url: config.api_prefix + config.api_url.trade_no, form: params});
        //console.info("result1 = " + resultBody);
        var tradeResult = JSON.parse(resultBody);
        var tradeNo;
        if (tradeResult.status.code == "0") {
            tradeNo = tradeResult.result;
            var UnifiedorderParams = {
                appid: config.wechat.appID,
                attach: '试运营',//附加数据
                body: 'paper go纸巾贩卖机',//商品描述
                mch_id: config.pay.mchId,
                nonce_str: utils.generateRandom(32),
                notify_url: config.wechat.homePrefix + config.pay.notifyPrefix,
                openid: req.body.open_id,
                out_trade_no: tradeNo,
                spbill_create_ip: req.connection.remoteAddress,
                total_fee: req.body.amount,
                trade_type: 'JSAPI',
                sign: '',
            };
            UnifiedorderParams.sign = utils.paySign(UnifiedorderParams);
            var payurl = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
            var bodyStr = '<xml> ' +
                '<appid>' + UnifiedorderParams.appid + '</appid> ' +
                '<attach>' + UnifiedorderParams.attach + '</attach> ' +
                '<body>' + UnifiedorderParams.body + '</body> ' +
                '<mch_id>' + UnifiedorderParams.mch_id + '</mch_id> ' +
                '<nonce_str>' + UnifiedorderParams.nonce_str + '</nonce_str> ' +
                '<notify_url>' + UnifiedorderParams.notify_url + '</notify_url>' +
                '<openid>' + UnifiedorderParams.openid + '</openid> ' +
                '<out_trade_no>' + UnifiedorderParams.out_trade_no + '</out_trade_no>' +
                '<spbill_create_ip>' + UnifiedorderParams.spbill_create_ip + '</spbill_create_ip> ' +
                '<total_fee>' + UnifiedorderParams.total_fee + '</total_fee> ' +
                '<trade_type>' + UnifiedorderParams.trade_type + '</trade_type> ' +
                '<sign>' + UnifiedorderParams.sign + '</sign> ' +
                '</xml>';
            console.info(bodyStr);

            requestBody = await
            utils.request_post({url: payurl, body: JSON.stringify(bodyStr)});
            var prepay_id = '';
            xml2jsparseString(requestBody, {explicitArray: false, ignoreAttrs: true}, function (err, result) {
                //console.dir(result.xml.return_code);
                var return_code = result.xml.return_code;
                if (return_code == "SUCCESS") {
                    prepay_id = result.xml.prepay_id;
                    console.log("prepay_Id ==== " + prepay_id);
                    var callPayParams = {
                        appId: config.wechat.appID,
                        timeStamp: parseInt(Date.now() / 1000),
                        nonceStr: utils.generateRandom(32),
                        package: "prepay_id=" + prepay_id,
                        signType: "MD5",
                        paySign: ''
                    }
                    callPayParams.paySign = utils.paySign(callPayParams);
                    res.render('trade', {
                        appId: callPayParams.appId,
                        timeStamp: callPayParams.timeStamp,
                        nonceStr: callPayParams.nonceStr,
                        packageStr: callPayParams.package,
                        signType: callPayParams.signType,
                        paySign: callPayParams.paySign
                    });
                } else {
                    res.render('msg', {
                        msg: result.xml.return_msg
                    });
                }
            });
        }else{
            res.render('error', {error: resultBody});
        }
    }catch(err){
        res.render('error', {error: err});
    }
});

module.exports = router;
