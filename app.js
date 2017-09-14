var express = require('express');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var superagent = require('superagent');
var cheerio = require('cheerio');
var charset = require('superagent-charset');
charset(superagent);
var schedule = require("node-schedule");
var moment = require('moment');
moment().format();


var app = express();


var mongoose1=require('./config/mongoose.js');
var db=mongoose1();


var ShiYeDanWeiOnePage=require('./config/ShiYeDanWeiOnePage.js');
var ShiYeDanWei_Controller = require('./controller/ShiYeDanWei');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//分页为客户端提供数据接口
app.post('/get_ShiYeDanWeis',ShiYeDanWei_Controller.getShiYeDanWeis);

/*定时任务爬取事业单位数据信息*/
var rule     = new schedule.RecurrenceRule();
//设置固定的时间去执行爬虫,,每个小时的第40分钟去爬虫~
rule.minute = 40;
schedule.scheduleJob(rule, function(){
  console.log(moment().format("YYYY-MM-DD HH:mm")+"开始执行爬虫成功！");
  //爬取各个城市的信息
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/nanchang/index.html","nanchang");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/jiujiang/index.html","jiujiang");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/shangrao/index.html","shangrao");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/xinyu/index.html","xinyu");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/jian/index.html","jian");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/fuzhou/index.html","fuzhou");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/yichun/index.html","yichun");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/jingdezhen/index.html","jingdezhen");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/yingtan/index.html","yingtan");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/ganzhou/index.html","ganzhou");
  ShiYeDanWeiOnePage.PaChong("http://www.shiyebian.net/jiangxi/pingxiang/index.html","pingxiang");
});
/**/


// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
