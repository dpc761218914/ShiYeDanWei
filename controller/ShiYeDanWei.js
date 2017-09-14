/**
 * Created by 1 on 2016/5/16.
 */
// index page
var mongoose=require('mongoose');

var ShiYeDanWei=mongoose.model('ShiYeDanWei');


exports.getShiYeDanWeis=function(req,res){
    var city=req.body.city;
    var page=req.body.page;

    if(city=="jiangxi"){
        /*查询全省数据*/
        ShiYeDanWei.find().sort({'time':-1}).limit(15).skip((page-1)*15).exec(function (err, doc) {
            if(err){
                res.json({"status":"error","msg":"error_system"});
            }else{
                if(doc.isNull){
                    res.json({"status":"success","msg":"data_empty"});
                }
                res.json({"status":"success","msg":doc});
            }
        })
    }

    else{
        /*查询各个省份数据*/
        ShiYeDanWei.find({city:city}).sort({'time':-1}).limit(15).skip((page-1)*15).exec(function (err, doc) {
            if(err){
                res.json({"status":"error","msg":"error_system"});
            }else{
                if(doc.isNull){
                    res.json({"status":"success","msg":"data_empty"});
                }
                res.json({"status":"success","msg":doc});
            }
        })
    }


}











