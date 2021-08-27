const express = require('express'); //搭建服务
const events = require('events'); //事件监听
const request = require('request'); //发送请求
const iconv = require('iconv-lite'); //网页解码
const cheerio = require('cheerio'); //网页解析
const app = express(); //服务端实例
const nodemailer = require("nodemailer");
const schedule = require("node-schedule"); //定时器
const router = express.Router();
// const conn = require('./conn')
const Event = new events.EventEmitter(); //事件监听实例

router.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == 'options')
    res.send(200); //让options尝试请求快速结束
  else
    next();
});

app.get('/', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send(`<h3>请访问以下形式的路径获取信息：</h3>
      <div>/fetchFundCodes</div>
      <div>/fetchFundInfo/:code</div>
      <div>/fetchFundData/:code/:per</div></br>
      <span>建议自建一套前端环境，以上只做服务接口用</span>`);
});
app.get('/fetchFundCodes', (req, res) => {
  let fundSpider = new FundSpider();
  res.header("Access-Control-Allow-Origin", "*");
  fundSpider.fetchFundCodes((err, data) => {
    res.send(data.toString());
  });
});
app.get('/fetchFundInfo/:code', (req, res) => {
  let fundSpider = new FundSpider();
  res.header("Access-Control-Allow-Origin", "*");
  fundSpider.fetchFundInfo(req.params.code, (err, data) => {
    res.send(JSON.stringify(data));
  });
});
app.get('/fetchFundData/:code/:stage', (req, res) => {
  let fundSpider = new FundSpider();
  res.header("Access-Control-Allow-Origin", "*");
  console.log(req.params)
  fundSpider.fetchFundData(req.params.code, req.params.stage, (err, data) => {
    res.send(JSON.stringify(data));
  });
});
app.get('/Fundstage/:code', (req, res) => {
  let fundSpider = new FundSpider();
  res.header("Access-Control-Allow-Origin", "*");
  console.log(req.params)
  fundSpider.fetchFundCodeInfo(req.params.code, (err, data) => {
    res.send(JSON.stringify(data));
  });
});
app.get('/fundtarget', (req, res) => {
  let fundSpider = new FundSpider();
  res.header("Access-Control-Allow-Origin", "*");
  res.send([...Up,...Down])  
});

app.listen(1234, () => {
  console.log("service start on port 1234");
});

//基金爬虫
class FundSpider {
  constructor(fragmentSize = 1000) {
    this.fragmentSize = fragmentSize;
    this.upFundArr = [];
    this.downFundArr = [];
    this.pages = 5;
  }

  // v1.0代码 废弃
  /* ToolTrend(flagdata) {
    let data = flagdata.reverse();
    let trendArr = [];
    let length = data.length;
    data.map((item, index) => {
      if (index == 0) {
        // var num = item.changePercent.slice(0,item.changePercent.length-2);
        // trendArr.push((parseFloat(num)*100).toFixed(2));
        trendArr.push('0.00');
      } else {
        var tempNum = item.changePercent.slice(0, item.changePercent.length - 1);
        // console.log(tempNum);
        var num = (1 + trendArr[index - 1] / 100) * (1 + tempNum / 100) - 1;
        // console.log(parseFloat(num))
        trendArr.push((parseFloat(num) * 100).toFixed(2));
      }
    })
    // console.log(trendArr)
    return trendArr;
  }*/

  TrendFund() {
    this.fetchFundCodes((err, codesArray) => {
      if (!err) {
        let codesLength = codesArray.length;
        console.log(codesArray.length)
        let itemNum = 0;
        let errorItems = [];
        let errorItemNum = 0;
        let correctItems = [];
        let correctItemNum = 0;

        let concurrentCtrl = new ConcurrentCtrl(this, this.fragmentSize, this.Fun, codesArray);
        Event.on("catch_TrendItem", (_code) => {
          itemNum++;
          console.log(`index: ${itemNum} --- code: ${_code}`);
          concurrentCtrl.go(itemNum);
          if (itemNum >= codesLength) {
            console.log("save finished");
            this.fundFlagSort();
            if (errorItems.length > 0) {
              console.log("---error code----");
              console.log(errorItems);
            }
          }
        });
        Event.on("error_TrendItem", (_code) => {
          errorItems.push(_code);
          errorItemNum++;
          console.log(`error index: ${errorItemNum} --- error code: ${_code}`);
        });
        Event.on("correct_TrendItem", (_code) => {
          correctItemNum++;
        });
        concurrentCtrl.go(0);
      }
    });
  }

  Fun(codesArray) {
    codesArray.map((code, index) => {
      this.fetchFundCodeInfo(code, (err, data) => {

        if (err) {
          Event.emit("error_TrendItem", codesArray[index]);
          Event.emit("catch_TrendItem", codesArray[index]);
        } else {
          // let trendArr = this.ToolTrend(data);
          // 以近一月为标准
          let monthAmout = Number(data.stageAmout['近1月'].replace(/%/g, ''));
          this.FilterFund(monthAmout, data, code);

          Event.emit("correct_TrendItem", codesArray[index]);
          Event.emit("catch_TrendItem", codesArray[index]);
        }
      })
    })
  }

  FilterFund(flag, data, code) {
    let WeekAmout = Number(data.stageAmout['近1周'].replace(/%/g, ''));
    let ThreeAmout = Number(data.stageAmout['近6月'].replace(/%/g, ''));
    let SixAmout = Number(data.stageAmout['近6月'].replace(/%/g, ''));
    let YearAmout = Number(data.stageAmout['近1年'].replace(/%/g, ''));
    let EvenAmout = Number(data.stageAmout['近3年'].replace(/%/g, ''));
    if (flag > 10 && YearAmout > 40 && SixAmout > 30 && WeekAmout > 0) {
      this.fetchFundInfo(code, (err, fundData) => {
        if(!err){
          var str = fundData.assetScale;
          console.log(str);
          var patt1 = /^(-?\d+)(\.\d+)/g;
          var num = str.match(patt1);
          if (parseFloat(num) > 10) {
            console.log('代码：', code, '近一月涨幅：', flag);
            this.upFundArr.push({
              code: code,
              Trend: flag + '%',
              fundName: fundData.fundName,
              Url: "http://fund.eastmoney.com/"+ code +".html"
            })
          }
        }
      })
    }
    if (WeekAmout < -5 && EvenAmout > 100 && flag < -10 && ThreeAmout > 30) {
      this.fetchFundInfo(code, (err, fundData) => {
        if(!err){
          var str = fundData.assetScale;
          var patt1 = /^(-?\d+)(\.\d+)/g;
          var num = str.match(patt1);
          if (parseFloat(num) > 10) {
            console.log('代码：', code, '下跌：', WeekAmout);
            this.downFundArr.push({
              code: code,
              Trend: WeekAmout + '%',
              fundName: fundData.fundName,
              Url: "http://fund.eastmoney.com/"+ code +".html"
            })
          }
        }
      })
    }
  }

   fetch(url, coding, callback) {
    return new Promise((resolve)=>{
      request({
        url: url,
        encoding: null
      },  (error, response, body) => {
        let _body = '';
        
        if (body) {
          _body = coding === "utf-8" ? body : iconv.decode(Buffer.from(body), coding);
        }
        if (!error && response.statusCode === 200 && _body) {
          callback(null, cheerio.load('<body>' + _body + '<body>'));
          resolve();
        } else {
          callback(error, cheerio.load('<body></body>'));
          resolve();
        }
      })
    })
  }

  fetchFundCodes(callback) {
    let url = "http://fund.eastmoney.com/allfund.html";
    let fundCodesArray = [];
    this.fetch(url, 'gb2312', (err, $) => {
      if (!err) {
        $('body').find('.num_right').find('li').each((i, item) => {
          let codeItem = $(item);
          let codeAndName = $(codeItem.find('a')[0]).text();
          let codeAndNameArr = codeAndName.split('）');
          let code = codeAndNameArr[0].substr(1);
          let fundName = codeAndNameArr[1];
          if (code) {
            fundCodesArray.push(code);
          }
        })
      }
      callback(err, fundCodesArray);
    })
  }

  fetchFundInfo(code, callback) {
    // https://fundf10.eastmoney.com/000001.html
    let fundUrl = "http://fundf10.eastmoney.com/" + code + ".html";
    let fundData = {
      fundCode: code
    };
    this.fetch(fundUrl, 'utf-8', (err, $) => {
      if (!err) {
        let dataRow = $('body').find('.detail .box').find("tr");
        // console.log(dataRow);
        fundData["fundName"] = $($(dataRow[0]).find("td")[0]).text(); //基金全称
        fundData["fundNameShort"] = $($(dataRow[0]).find("td")[1]).text(); //基金简称
        fundData["fundType"] = $($(dataRow[1]).find("td")[1]).text(); //基金类型
        fundData["releaseDate"] = $($(dataRow[2]).find("td")[0]).text(); //发行日期
        fundData["buildDate"] = $($(dataRow[2]).find("td")[1]).text(); //成立日期/规模
        fundData["assetScale"] = $($(dataRow[3]).find("td")[0]).text(); //资产规模
        fundData["shareScale"] = $($(dataRow[3]).find("td")[1]).text(); //份额规模
        fundData["administrator"] = $($(dataRow[4]).find("td")[0]).text(); //基金管理人
        fundData["custodian"] = $($(dataRow[4]).find("td")[1]).text(); //基金托管人
        fundData["manager"] = $($(dataRow[5]).find("td")[0]).text(); //基金经理人
        fundData["bonus"] = $($(dataRow[5]).find("td")[1]).text(); //分红
        fundData["managementRate"] = $($(dataRow[6]).find("td")[0]).text(); //管理费率
        fundData["trusteeshipRate"] = $($(dataRow[6]).find("td")[1]).text(); //托管费率
        fundData["saleServiceRate"] = $($(dataRow[7]).find("td")[0]).text(); //销售服务费率
        fundData["subscriptionRate"] = $($(dataRow[7]).find("td")[1]).text(); //最高认购费率
      }
      callback(err, fundData);
    })
  }

  fetchFundCodeInfo(code, callback) {
    let fundUrl = 'http://fund.eastmoney.com/' + code + '.html';
    let fundUpDownData = {};

    this.fetch(fundUrl, 'utf-8', (err, $) => {
      if (!err) {
        let tabAmout = $('body').find('#increaseAmount_stage');
        let IncreaseData = tabAmout.find('tr');

        fundUpDownData['stageAmout'] = {
          // typeName:$($(IncreaseData[1])).find(".typeName").text(),
          近1周: $($(IncreaseData[1]).find(".Rdata")[0]).text(),
          近1月: $($(IncreaseData[1]).find(".Rdata")[1]).text(),
          近3月: $($(IncreaseData[1]).find(".Rdata")[2]).text(),
          近6月: $($(IncreaseData[1]).find(".Rdata")[3]).text(),
          今年来: $($(IncreaseData[1]).find(".Rdata")[4]).text(),
          近1年: $($(IncreaseData[1]).find(".Rdata")[5]).text(),
          近2年: $($(IncreaseData[1]).find(".Rdata")[6]).text(),
          近3年: $($(IncreaseData[1]).find(".Rdata")[7]).text(),
        };
        fundUpDownData['averageAmout'] = {
          // typeName:$($(IncreaseData[2])).find(".typeName").text().slice(0,4),
          近1周: $($(IncreaseData[2]).find(".Rdata")[0]).text(),
          近1月: $($(IncreaseData[2]).find(".Rdata")[1]).text(),
          近3月: $($(IncreaseData[2]).find(".Rdata")[2]).text(),
          近6月: $($(IncreaseData[2]).find(".Rdata")[3]).text(),
          今年来: $($(IncreaseData[2]).find(".Rdata")[4]).text(),
          近1年: $($(IncreaseData[2]).find(".Rdata")[5]).text(),
          近2年: $($(IncreaseData[2]).find(".Rdata")[6]).text(),
          近3年: $($(IncreaseData[2]).find(".Rdata")[7]).text(),
        };
        fundUpDownData['csiAmout'] = {
          // typeName:$($(IncreaseData[3])).find(".typeName").text(),
          近1周: $($(IncreaseData[3]).find(".Rdata")[0]).text(),
          近1月: $($(IncreaseData[3]).find(".Rdata")[1]).text(),
          近3月: $($(IncreaseData[3]).find(".Rdata")[2]).text(),
          近6月: $($(IncreaseData[3]).find(".Rdata")[3]).text(),
          今年来: $($(IncreaseData[3]).find(".Rdata")[4]).text(),
          近1年: $($(IncreaseData[3]).find(".Rdata")[5]).text(),
          近2年: $($(IncreaseData[3]).find(".Rdata")[6]).text(),
          近3年: $($(IncreaseData[3]).find(".Rdata")[7]).text(),
        };
        callback(err, fundUpDownData);
      } else {
        callback(err, {});
      }
    })
  }

  getDataStr(dd) {
    let y = dd.getFullYear();
    let m = (dd.getMonth() + 1) < 10 ? "0" + (dd.getMonth() + 1) : (dd.getMonth() + 1);
    let d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
    return y + '-' + m + '-' + d;
  }

  // v1.1代码，已废弃
  /*  fetchFundUrl(url, callback) {
    this.fetch(url, 'gb2312', (err, $) => {
      let fundData = [];
      if (!err) {
        let bodyText = $('body').text().split('pages')[1];
        var patt1 = /[0-9]+/g;
        let pages = bodyText.match(patt1)[0];
        let curpage = bodyText.match(patt1)[1];
        let table = $('body').find('table');
        let tbody = table.find('tbody');

        try {
          tbody.find("tr").each((i, trItem) => {
            let fundItem = {};
            let tdArray = $(trItem).find("td").map((j, tdItem) => {
              return $(tdItem);
            })
            fundItem.date = tdArray[0].text();
            fundItem.unitNet = tdArray[1].text();
            fundItem.accumulatedNet = tdArray[2].text();
            fundItem.changePercent = (tdArray[3].text().indexOf('%') > -1) ? tdArray[3].text() : '';
            fundData.push(fundItem);
          });
          callback(err, fundData);
        } catch (e) {
          // console.log(e);
          callback(e, []);
        }
      }
    })
  } */

   async fetchFundData(code, stage, callback) {
    // &code=000001&sdate=2015-05-05&edate=2018-05-05&per=10
    let fundUrl = "https://fundf10.eastmoney.com/F10DataApi.aspx?type=lsjz";
    let date = new Date();
    let dateNow = new Date();
    let sdate = '';
    let edate = '';

    if(stage == 'oneweek'){
      sdate = this.getDataStr(new Date(date.setMonth(date.getMonth(),date.getDate() - 7)));
      edate = this.getDataStr(dateNow);
    }
    if(stage == 'onemonth'){
      sdate = this.getDataStr(new Date(date.setMonth(date.getMonth() - 1)));
      edate = this.getDataStr(dateNow);
    }
    if(stage == 'threemonth'){
      sdate = this.getDataStr(new Date(date.setMonth(date.getMonth() - 3)));
      edate = this.getDataStr(dateNow);
    }
    if(stage == 'oneyear'){
      sdate = this.getDataStr(new Date(date.setFullYear(date.getFullYear() - 1)));
      edate = this.getDataStr(dateNow);
    }
    if(stage == 'threeyear'){
      sdate = this.getDataStr(new Date(date.setFullYear(date.getFullYear() - 3)));
      edate = this.getDataStr(dateNow);
    }

    
    let fundData = [];
    let curpage = 1;
    for(let curpage=1;curpage<=this.pages;curpage++){
      fundUrl += ("&code=" + code + "&sdate=" + sdate + "&edate=" + edate + "&page=" + curpage);
      await this.fetch(fundUrl, 'gb2312', (err, $) => {
        if (!err) {
          let bodyText = $('body').text().split('pages')[1];
          let patt1 = /[0-9]+/g;
          this.pages = bodyText.match(patt1)[0];
          let table = $('body').find('table');
          let tbody = table.find('tbody');
  
          tbody.find("tr").each((i, trItem) => {
            let fundItem = {};
            let tdArray = $(trItem).find("td").map((j, tdItem) => {
              return $(tdItem);
            })
            fundItem.date = tdArray[0].text();
            fundItem.unitNet = tdArray[1].text();
            fundItem.accumulatedNet = tdArray[2].text();
            fundItem.changePercent = (tdArray[3].text().indexOf('%') > -1) ? tdArray[3].text() : '';
            fundData.push(fundItem);
          });
        }
      })
      fundUrl = 'https://fundf10.eastmoney.com/F10DataApi.aspx?type=lsjz';
    }
    callback('err', fundData);
  }

  fundFragmentSave(codesArray) {
    for (let i = 0; i < codesArray.length; i++) {
      this.fetchFundInfo(codesArray[i], (error, fundData) => {
        if (error) {
          Event.emit("error_fundItem", codesArray[i]);
          Event.emit("save_fundItem", codesArray[i]);
        } else {
          let sql = `insert into funddata values('${fundData.fundCode}','${fundData.fundCode}','${fundData.fundName}','${fundData.fundNameShort}','${fundData.fundType}','${fundData.releaseDate}','${fundData.buildDate}','${fundData.assetScale}','${fundData.shareScale}','${fundData.administrator}','${fundData.custodian}','${fundData.manager}','${fundData.bonus}','${fundData.managementRate}','${fundData.trusteeshipRate}','${fundData.saleServiceRate}','${fundData.subscriptionRate}')`
          conn.query(sql, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              // fundData["_id"] = fundData.fundCode;
              Event.emit("correct_fundItem", codesArray[i]);
              Event.emit("save_fundItem", codesArray[i]);
            }
          })
        }
      });
    }
  }

  fundToSave(err, codesArray) {
    if (!err) {
      let codesLength = codesArray.length;
      let itemNum = 0;
      let errorItems = [];
      let errorItemNum = 0;
      let correctItems = [];
      let correctItemNum = 0;

      console.log(`基金数目总计${codesLength}个`);
      let concurrentCtrl = new ConcurrentCtrl(this, this.fragmentSize, this.fundFragmentSave, codesArray);
      Event.on("save_fundItem", (_code) => {
        itemNum++;
        console.log(`index: ${itemNum} --- code: ${_code}`);
        concurrentCtrl.go(itemNum);
        if (itemNum >= codesLength) {
          console.log("save finished");
          if (errorItems.length > 0) {
            console.log("---error code----");
            console.log(errorItems);
          }
        }
      });
      Event.on("error_fundItem", (_code) => {
        errorItems.push(_code);
        errorItemNum++;
        console.log(`error index: ${errorItemNum} --- error code: ${_code}`);
      });
      Event.on("correct_fundItem", (_code) => {
        correctItemNum++;
      });
      concurrentCtrl.go(0);
    }
  }

  fundSave(_codesArray) {
    if (!_codesArray) {
      this.fetchFundCodes((err, codesArray) => {
        this.fundToSave(err, codesArray);
      })
    } else {
      _codesArray = Object.prototype.toString.call(_codesArray) === '[object Array]' ? _codesArray : [];
      if (_codesArray.length > 0) {
        this.fundToSave(null, _codesArray);
      } else {
        console.log("not enough codes to fetch");
      }

    }
  }

  fundFlagSort() {
    this.upFundArr.sort(compare);
    this.downFundArr.sort(compare);
    console.log('-->', this.upFundArr);
    console.log('<--', this.downFundArr);
  }
}

class ConcurrentCtrl {
  constructor(parent, splitNum, fn, dataArray = []) {
    this.parent = parent;
    this.splitNum = splitNum;
    this.fn = fn;
    this.dataArray = dataArray;
    this.length = dataArray.length;
    this.itemNum = Math.ceil(this.length / splitNum);
    this.restNum = (this.length % splitNum) === 0 ? splitNum : (this.length % splitNum);
  }

  go(index) {
    let _this = this;
    let ResArr = [];
    if ((index % this.splitNum) === 0) {
      if (index / this.splitNum < (this.itemNum - 1)) {
        console.log('-----------', index)
        setTimeout(() => {
          _this.fn.call(this.parent, this.dataArray.slice(index, index + this.splitNum));
        }, 1000)
      } else {
        setTimeout(() => {
          _this.fn.call(this.parent, this.dataArray.slice(index, index + this.restNum));
        }, 1000)
      }
    }
  }
}

function compare(obj1, obj2) {
  var val1 = obj1.Trend;
  var val2 = obj2.Trend;
  if (val1 < val2) {
    return -1;
  } else if (val1 > val2) {
    return 1;
  } else {
    return 0;
  }
}

// let fundSpider = new FundSpider(200);
// fundSpider.TrendFund();
/* fundSpider.fetchFundCodeInfo('003095',(err,data)=>{
  console.log(data);
}) */

// 发送邮件函数
async function sendMail(text) {
  var user = "你的邮箱"; //自己的邮箱
  var pass = "邮箱授权码"; //qq邮箱授权码,如何获取授权码请百度
  var to = ""; //对方的邮箱
  let transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 587,
    secure: false,
    auth: {
      user: user, // 用户账号
      pass: pass, //授权码,通过QQ获取
    },
  });
  let info = await transporter.sendMail({
    from: `来自<${user}>`, // sender address
    to: `给<${to}>`, // list of receivers
    subject: "test", // Subject line
    text: text, // plain text body
    html: html
  });
  console.log("发送成功");
}

let Up = [];
let Down = [];
let html = '';
let fundSpider = new FundSpider(20);
// fundSpider.TrendFund();

//定时发送
schedule.scheduleJob({
  hour: 10,
  minute: 00
}, function () {
  fundSpider.TrendFund();
  console.log("启动任务:" + new Date());
});

schedule.scheduleJob({
  hour: 10,
  minute: 30
}, function () {
  Up = fundSpider.upFundArr;
  Down = fundSpider.downFundArr;
  html += `<table border="1" cellpadding="0" cellspacing="0" width="800">
            <thead align="center">
              <tr>
                <th>基金代码</th>
                <th>涨幅</th>
                <th>下跌</th>
                <th>查看详情</th>
              </tr>
            </thead>
            <tbody align="center">`;
  Up.forEach((item)=>{
    html += `<tr>
      <td>${item.code}</td>
      <td>${item.Trend}%</td>
      <td></td>
      <td><a href="http://fund.eastmoney.com/${item.code}.html">${item.code}</a></td>
    </tr>`;
  })
  
  Down.forEach((item)=>{
    html += `<tr>
      <td>${item.code}</td>
      <td></td>
      <td>${item.Trend}%</td>
      <td><a href="http://fund.eastmoney.com/${item.code}.html">${item.code}</a></td>
    </tr>`;
  })
  html += `</tbody>
        </table>`
  sendMail();
  html = '';
  fundSpider.downFundArr = [];
  fundSpider.upFundArr = [];
});
