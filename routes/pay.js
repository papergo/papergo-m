var express = require('express');  
var router = express.Router();  
var config = require('../config/config');
var xml2jsparseString = require('xml2js').parseString;
var utils = require('../common/utils');
  
router.post('/notify',async function (req, res) {
    
    if(req.body.xml.return_code == "SUCCESS"){
        console.info(" 订单号: " + req.body.xml.out_trade_no);
        //通知后台支付成功
        var params = {
            "trade_no" : req.body.xml.out_trade_no,
            "result" : "1"
        };
        //TODO 支付成功后的逻辑待定
        try{
            await utils.request_post({ url:config.api_prefix + config.api_url.pay_result , form :params});
        }catch(err){
            console.log("通知支付成功发生错误:" + err);
        }
        var bodyStr ='<xml> ' +
                          '<return_code><![CDATA[SUCCESS]]></return_code> ' +
                          '<return_msg><![CDATA[OK]]></return_msg> ' +
                          '</xml>';
        res.send(bodyStr);
    }else{
        res.render('msg', {msg: "支付失败"});
    }   
});


router.get('/success', function(req,res, next){
    res.render('success');
});


// 导出  
module.exports = router;  
