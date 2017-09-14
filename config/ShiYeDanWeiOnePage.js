/**
 * 养生的一页爬虫
 */
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
