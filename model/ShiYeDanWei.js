/**
 * Created by 1 on 2016/5/16.
 */
var mongoose=require('mongoose');
//自己生成的_id
var shortid = require('shortid');

var  ShiYeDanWeiSchema=new mongoose.Schema({
    //自定义生成的uuid
    _id: {
        type: String,
        'default': shortid.generate
    },
    title:String,
    description:String,
    link:String,
    time:String,
    city:String,
}, {versionKey:false});//这里关闭自动生成_id的字段

mongoose.model('ShiYeDanWei',ShiYeDanWeiSchema,"ShiYeDanWei");//让自己定义的schema和数据库中的表对应起来.