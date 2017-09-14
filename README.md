###一、项目描述
  **前言：**毕业来现在单位上班两个多月了，之前考单位的招聘信息还是室友转发给我的，自己对这方面招聘没有过多的关注，对于嫌考考公务员困难的同学还是通过考事业编找一份不太折腾的工作，那么或许这个app就为您提供便利了。

  **希望实现的功能：**后台通过Node.js定时任务从网站爬取相关信息存入到数据库，然后为移动端提供数据接口，不过需要注意的是，爬去数据时，对于数据库已存在的招聘信息就无需存入数据库。而后用户通过app即可查看江西各省市的招考信息。

###二、项目描述
**模块：**1、Moment.js node主要用户判断当前的时间。   2、Express node的快速web开发框架。  3、mongoose MongoDB的ORM模块，4、superagent  是nodejs里一个非常方便的客户端请求代理模块，当你想处理get,post,put,delete,head请求时,你就应该想起该用它了。5、cheerio 服务端的jquery，在服务端分析网页并提取相应的信息。 6、superagent-charset 爬去数据的时候注意爬取出数据的编码，7、schedule 定时任务模块，例如这里我每隔一小时爬取网站信息。7、eventproxy 并发控制模块，并发爬虫效率更高，同时node.js是异步的。

**实现思路：**分析事业单位招聘网：http://www.shiyebian.net/jiangxi/ 该链接展示全部江西事业单位招聘信息，如果查看点击南昌地区：http://www.shiyebian.net/jiangxi/nanchang/，我们可以看出每个城市的招聘只要加城市名就好了。这样我们就可以分类把招聘信息爬取下来。

###三、项目截图
项目启动部署后，爬虫自动每一个小时运行一次~~~

![项目在webstrom中运行截图](http://upload-images.jianshu.io/upload_images/2227968-634264ad1df87fd7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



![app首页.jpg](http://upload-images.jianshu.io/upload_images/2227968-396bcb4c1e0a4d64.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![招聘详情.jpg](http://upload-images.jianshu.io/upload_images/2227968-dcc2735914d95ec9.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![介绍.jpg](http://upload-images.jianshu.io/upload_images/2227968-67f351286bc85b52.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



###四、部分代码
- 4.1、首先分析网页http://www.shiyebian.net/jiangxi/nanchang/的源代码，我们可以分析出具体的招聘信息在ul标签class为lie1下，同时em标签存储了日期，a标签的href存储了招聘详细内容的超链接，而a标签存储了标题。我们可以将其取出并存入到二维数组中。
![分析招聘信息html.png](http://upload-images.jianshu.io/upload_images/2227968-e247d24165e1377c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
然后我们在分析其招聘信息的详情页面，我们可以发现招聘的详情存在div的class为zhengwen的标签中，同时div的class为info中有招聘发布的详细时间，我们可以将它获取下来（因为前面的列表页面只有日记，没有时间，我们不好对它排序），
![招聘详情页面.png](http://upload-images.jianshu.io/upload_images/2227968-de6a7e1a4e9a081d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
分析好了网页的html规律，我们需要将内容提取出来，然后将其存入到数据库中去。具体代码如下，我们将爬虫暴露成一个函数供外部调用（外部app.js文件中在使用该函数的时候需要传入城市的url和城市type），在数据存入数据库的过程中需要判断数据库中是否存在此条招聘记录，我们通过时间来判断，我这里默认每条招聘信息发布的时间是不同的，到目前来看，是可以区分不同的招聘记录的：
```
var superagent = require('superagent');
var cheerio = require('cheerio');
var charset = require('superagent-charset');
charset(superagent);

//批量操作,解决回调问题
var EventProxy  = require('eventproxy');

var mongoose=require('mongoose');
var ShiYeDanWei=mongoose.model('ShiYeDanWei');

exports.PaChong= function(url,city){
    console.log("开始爬取"+city+"数据，其URL为"+url);
    superagent.get(url)
        .charset('gb2312') //这里设置编码
        .end(function (err, sres) {
            var $ = cheerio.load(sres.text);
            //  console.log("完整数据"+sres.text);
            var datas = [];
            //获取记录详情每段的详细内容
            $('.lie1 li').each(function (index, element) {
                var $element = $(element);
                var href = $(this).find('a').attr("href");
                var title = $(this).find('a').text();
                datas.push([title,href]);
            });

            var ep = new EventProxy();
            ep.after('get_detail', datas.length, function () {
                console.log('获取单页详情成功');
            });
           // console.log(datas);
            datas.forEach(function (data) {
                //拼接详情内容url
                var url_detail=data[1];
               // console.log("内容详情url为："+url_detail)
                superagent.get(url_detail)
                    .charset('gb2312') //这里设置编码
                    .end(function (err, sres) {
                        var $ = cheerio.load(sres.text);
                        var items = "";
                        //获取每条招聘详细的发布时间
                        var mytime=$('.info').text().substring(5,25);
                        //判断数据库是否存在此记录
                        ShiYeDanWei.findOne({time:mytime}, function (err, docs) {
                            if(err){

                            }else if(docs==null){

                                $('.zhengwen p').each(function (index, element) {
                                    var $element = $(element);
                                    items=items+$element.html()+"</br>";//拼接HTML
                                    ep.emit('get_detail');
                                });
                                var newShiYeDanWei=new ShiYeDanWei(
                                    {
                                        title:data[0],
                                        link:data[1],
                                        //替换掉事业单位招聘考试网信息
                                        description:items,
                                        time:mytime,
                                        city:city,
                                    }
                                );

                                newShiYeDanWei.save(function(err){
                                    if(err){
                                        console.log("save error");
                                    }else{
                                        console.log('保存_'+data[0]+"_成功！");
                                        ep.emit('get_detail');
                                    }
                                });
                            }
                        });
                    });
            });
        });
}

```
- 4.2、关于定时app.js文件定时任务，主要是注意node.js schedul包的用法就好了~

```
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
```

###五、源码与展望
- 5.1、项目源代码： https://github.com/dpc761218914/ShiYeDanWei
- 5.2、客户端源代码：客户端测试版下载地址：https://www.pgyer.com/ShiYeDanWei  客户端代码随后分享~