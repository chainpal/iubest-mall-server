const moment = require('moment')
const mongoose = require('../mongoose')
const request = require('request');
const xmlreader = require("xmlreader");
const fs = require("fs");
const config = require('../config')
const crypto = require('crypto');
const parseString = require('xml2js').parseString; // xml转js对象



exports.pay = (req,res) => {
    console.log("payApi.pay is called")
    console.log(req.body)

    var opt = {
      appid:config.AppID, //小程序ID
      body:"电动车：" + req.body.body,    //商品描述
      mch_id:config.MchID, //商户号
      nonce_str:getNonce(32),       //随机字符串
      notify_url:config.NotifyURL,    //通知地址
      out_trade_no:req.body.out_trade_no,    //商户订单号
      openid:req.body.openid,
      spbill_create_ip:"154.8.210.38",      //终端IP
      total_fee:req.body.total_fee,    //标价金额
      trade_type:'JSAPI', //交易类型
    }

//    let stringA = `appid=${opt.appid}&body=${opt.body}&mch_id=${opt.mch_id}&nonce_str=${opt.nonce_str}&notify_url=${opt.notify_url}&out_trade_no=${opt.out_trade_no}&spbill_create_ip=${opt.spbill_create_ip}&total_fee=${opt.total_fee}&trade_type=${opt.trade_type}`
    let stringA =`appid=${opt.appid}&body=${opt.body}&mch_id=${opt.mch_id}&nonce_str=${opt.nonce_str}&notify_url=${opt.notify_url}&openid=${opt.openid}&out_trade_no=${opt.out_trade_no}&spbill_create_ip=${opt.spbill_create_ip}&total_fee=${opt.total_fee}&trade_type=${opt.trade_type}`
    

    let stringSignTemp=stringA+"&key="+config.APIKey //key为商户平台设置的密钥key
    
    var md5 = crypto.createHash('md5');
    md5.update(stringSignTemp);
    sign = md5.digest('hex').toUpperCase();
    //sign=MD5(stringSignTemp).toUpperCase() //注：MD5签名方式

    console.log("stringSignTemp: " + stringSignTemp)
    console.log("sign: " + sign)
    

    var bodyData = '<xml>';
bodyData += '<appid>' + opt.appid + '</appid>'; // 小程序ID
bodyData += '<body>' + opt.body + '</body>'; // 商品描述
bodyData += '<mch_id>' + opt.mch_id + '</mch_id>'; // 商户号
bodyData += '<nonce_str>' + opt.nonce_str + '</nonce_str>'; // 随机字符串
bodyData += '<notify_url>' + opt.notify_url + '</notify_url>'; // 支付成功的回调地址
bodyData += '<openid>' + opt.openid + '</openid>'; // 用户标识
bodyData += '<out_trade_no>' + opt.out_trade_no + '</out_trade_no>'; // 商户订单号
bodyData += '<spbill_create_ip>' + opt.spbill_create_ip + '</spbill_create_ip>'; // 终端IP
bodyData += '<total_fee>' + opt.total_fee + '</total_fee>'; // 总金额 单位为分
bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
bodyData += '<sign>' + sign + '</sign>';
bodyData += '</xml>';


     console.log("bodyData: " + bodyData)

    var urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
request({
	url: urlStr,
	method: 'POST',
	body: bodyData
}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var returnValue = {};
			parseString(body, function (err, result) {
				if (result.xml.return_code[0] == 'SUCCESS') {
					/*
					returnValue.msg = '操作成功';
					returnValue.status = '100';
					returnValue.out_trade_no = opt.out_trade_no; // 商户订单号
					// 小程序 客户端支付需要 nonceStr,timestamp,package,paySign 这四个参数
					returnValue.nonceStr = result.xml.nonce_str[0]; // 随机字符串
					returnValue.timestamp = timestamp.toString(); // 时间戳
					returnValue.package = 'prepay_id=' + result.xml.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
					//returnValue.paySign = paysignjs(wxConfig.AppID, returnValue.nonceStr, returnValue.package, 'MD5',timestamp); // 签名
					let sighStr = 
					md5.update("");
    					sign = md5.digest('hex').toUpperCase();
					*/
					res.end(JSON.stringify(returnValue));
				} else{
					returnValue.msg = result.xml.return_msg[0];
					returnValue.status = '102';
					res.end(JSON.stringify(returnValue));
				}
			});
		}
		console.log("response:"+ response.body);
})


    /*res.json({
        code: 200,
        message: '调用payApi.pay成功',
        data: opt,
	stringA: stringA
    })*/
    
}


exports.notify = (req,res) => {
    console.log("payApi.notify is called")
    console.log(req.body)
}


getNonce = len => {
        // isFinite 判断是否为有限数值
    if (!Number.isFinite(len)) {
        throw new TypeError('Expected a finite number');
    }

    return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
};


