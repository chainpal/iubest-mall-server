const moment = require('moment')
const mongoose = require('../mongoose')
const request = require('request');


exports.pay = (req,res) => {
    console.log("payApi.pay is called")
    res.json({
        code: 200,
        message: '调用payApi.pay成功',
        data: {
        }
    })
    
}

