const events = require('events'); //事件监听
const request = require('request'); //发送请求
const iconv = require('iconv-lite'); //网页解码
const cheerio = require('cheerio'); //网页解析
const conn = require('./conn.js'); //数据库连接
const nodemailer = require("nodemailer"); // 邮箱发送器

const Event = new events.EventEmitter(); //事件监听实例

//基金爬虫
class FundSpider {
  constructor(fragmentSize = 100) {
    this.fragmentSize = fragmentSize;
    this.upFundArr = [];
    this.downFundArr = [];
    this.optionFundCode = [];
    // this.optionFundCode = ['003095','003984','519674','001475'];
    this.optionFundAll = [];
    this.pages = 5;
    this.RisingOneweek = 5;
    this.RisingOnemonth = 10;
    this.RisingThreemonth = 20;
    this.RisingSixmonth = -40;
    this.RisingFromyear = -40;
    this.RisingOneyear = -40;
    this.RisingTwoyear = -40;
    this.RisingThreeyear = 0;
    this.FallingOneweek = -5;
    this.FallingOnemonth = -10;
  }

  async OptionFundData(username , callback){
    this.optionFundAll = [];

    // 查询自选基金
    let sql = `select * from fundoption where userName='${username}'`
    conn.query(sql, (err, res)=>{
      if(err) throw err
      if(res.length>0) {
        res.forEach(item => {
          this.optionFundCode.push(item.fundCode)
        })
        new Promise((resolve, reject) => {
          this.optionFundCode.forEach((code, idx) => {
            // 查询基金信息
            let sql2 = `select * from funddata where fundCode='${code}'`
            conn.query(sql2,(error, reslut)=>{
              if(error) throw error
              if(reslut.length>0) {
                let fundData = reslut[0]
                this.fetchFundData(code, 'oneweek', (err, data)=>{
                  this.optionFundAll.push({
                    code: code,
                    Trend: data[0].changePercent,
                    fundName: fundData.fundNameShort,
                    assetScale: fundData.assetScale,
                    Url: "http://fund.eastmoney.com/"+ code +".html"
                  })
                  if (this.optionFundAll.length == res.length) {
                    resolve(this.optionFundAll)
                  }
                })
              }
            })
          })
        }).then((data)=>{
          callback(data)
        })
      }else {
        callback(this.optionFundAll)
      }
    })
  }

  TargetFundData(username, callback) {
    // 查询用户定义规则,注册未定义规则给定默认规则
    let rulessql = `select * from fundrule where userName='${username}'`
    conn.query(rulessql, (err,rs)=>{
      if(err) throw err
      if(rs.length>0){
        let rules = rs[0]
        this.RisingOneweek = rules.risingOneweek
        this.RisingOnemonth = rules.risingOnemonth
        this.RisingThreemonth = rules.risingThreemonth
        this.RisingSixmonth = rules.risingSixmonth
        this.RisingFromyear = rules.risingFromyear
        this.RisingOneyear = rules.risingOneyear
        this.RisingTwoyear = rules.risingTwoyear
        this.RisingThreeyear = rules.risingThreeyear
        this.FallingOneweek = rules.fallingOneweek
        this.FallingOnemonth = rules.FallingOnemonth
      }else {
        let sql3 = `insert into fundrule values(
          '${username}',
          ${this.RisingOneweek},
          ${this.RisingOnemonth},
          ${this.RisingThreemonth},
          ${this.RisingSixmonth},
          ${this.RisingFromyear},
          ${this.RisingOneyear},
          ${this.RisingTwoyear},
          ${this.RisingThreeyear},
          ${this.FallingOneweek},
          ${this.FallingOnemonth}
        )`

        conn.query(sql3, (e, r)=>{
          if(e) throw e
        })
      }

      // 查询符合上涨基金
      let sql1 = `select * from fundstage where type='阶段涨幅' 
        and nearlyOneWeek>${this.RisingOneweek} 
        and nearlyOneMonth>${this.RisingOnemonth} 
        and nearlyThreeMonth>${this.RisingThreemonth} 
        and nearlySixMonth>${this.RisingSixmonth} 
        and FromYear>${this.RisingFromyear} 
        and nearlyOneYear>${this.RisingOneyear} 
        and nearlyTwoyear>${this.RisingTwoyear} 
        and nearlyThreeyear>${this.RisingThreeyear}`
      // 查询符合下跌基金
      let sql2 = `select * from fundstage where type='阶段涨幅'
        and nearlyOneWeek<${this.FallingOneweek}
        and nearlyOneMonth<${this.FallingOnemonth}`
      
      // 异步标识
      let flag = 0
      
      new Promise((resolve, reject)=>{
        conn.query(sql1, (e, r)=>{
          if(e) throw e
          if(r.length>0) {
            new Promise((rle,rej)=>{
              r.forEach((item,idx) => {
                // 查询基金信息
                let sql3 = `select * from funddata where fundCode=${item.fundCode}`
                conn.query(sql3, (error, result)=>{
                  if(error) throw error
                  if(result.length>0) {
                    let fundData = result[0]
                    let patt1 = /^(-?\d+)(\.\d+)/g
                    let Scale = parseFloat(fundData.assetScale.match(patt1))
                    if(Scale>10){
                      this.upFundArr.push({
                        code: fundData.fundCode,
                        Trend: item.nearlyOneWeek + '%',
                        fundName: fundData.fundNameShort,
                        assetScale: fundData.assetScale,
                        Url: "http://fund.eastmoney.com/"+ fundData.fundCode +".html"
                      })
                    }
                    if(idx == r.length-1) {
                      rle(this.upFundArr)
                    }
                  }
                })
              });
            }).then((data)=>{
              flag++
              if(flag == 2) {
                let fundtarget = [...this.upFundArr,...this.downFundArr]
                resolve(fundtarget)
              }
            })
          }else{
            flag++
            if(flag == 2) {
              let fundtarget = [...this.upFundArr,...this.downFundArr]
              resolve(fundtarget)
            }
          }
        })
    
        conn.query(sql2, (e, r)=>{
          if(e) throw e
          if(r.length>0) {
            new Promise((rle,rej)=>{
              r.forEach((item,idx) => {
                // 查询基金信息
                let sql3 = `select * from funddata where fundCode=${item.fundCode}`
                conn.query(sql3, (error, result)=>{
                  if(error) throw error
                  if(result.length>0) {
                    let fundData = result[0]
                    let patt1 = /^(-?\d+)(\.\d+)/g
                    let Scale = parseFloat(fundData.assetScale.match(patt1))
                    if(Scale>10){
                      this.downFundArr.push({
                        code: fundData.fundCode,
                        Trend: item.nearlyOneWeek + '%',
                        fundName: fundData.fundNameShort,
                        assetScale: fundData.assetScale,
                        Url: "http://fund.eastmoney.com/"+ fundData.fundCode +".html"
                      })
                    }
                    if(idx == r.length-1) {
                      rle(this.downFundArr)
                    }
                  }
                })
              });
            }).then((data)=>{
              flag++
              if(flag == 2) {
                let fundtarget = [...this.upFundArr,...this.downFundArr]
                resolve(fundtarget)
              }
            })
          }else{
            flag++
            if(flag == 2) {
              let fundtarget = [...this.upFundArr,...this.downFundArr]
              resolve(fundtarget)
            }
          }
        })
      }).then((data)=>{
        data = fundFlagSort(data)
        callback(data)
      })
    })
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

  async fetchFundCodeInfo(code, callback) {
    let fundUrl = 'http://fund.eastmoney.com/' + code + '.html';
    let fundUpDownData = {};

    await this.fetch(fundUrl, 'utf-8', (err, $) => {
      if (!err) {
        let Title = $('body').find('.fundDetail-tit').text();
        let FundName = Title.split('(')[0];
        fundUpDownData['fundName'] = FundName; 
        let tabInfo = $('body').find('.infoOfFund').find('tr');
        let scaleInfo = $(tabInfo[0]).find('td');
        let assetScale = $(scaleInfo[1]).text().split('：')[1];
        fundUpDownData['assetScale'] = assetScale;
        let tabAmout = $('body').find('#increaseAmount_stage');
        let IncreaseData = tabAmout.find('tr');

        fundUpDownData['stageAmout'] = {
          // typeName:$($(IncreaseData[1])).find(".typeName").text(),
          近1周: Number($($(IncreaseData[1]).find(".Rdata")[0]).text().replace(/%/g, '')),
          近1月: Number($($(IncreaseData[1]).find(".Rdata")[1]).text().replace(/%/g, '')),
          近3月: Number($($(IncreaseData[1]).find(".Rdata")[2]).text().replace(/%/g, '')),
          近6月: Number($($(IncreaseData[1]).find(".Rdata")[3]).text().replace(/%/g, '')),
          今年来: Number($($(IncreaseData[1]).find(".Rdata")[4]).text().replace(/%/g, '')),
          近1年: Number($($(IncreaseData[1]).find(".Rdata")[5]).text().replace(/%/g, '')),
          近2年: Number($($(IncreaseData[1]).find(".Rdata")[6]).text().replace(/%/g, '')),
          近3年: Number($($(IncreaseData[1]).find(".Rdata")[7]).text().replace(/%/g, '')),
        };
        fundUpDownData['averageAmout'] = {
          // typeName:$($(IncreaseData[2])).find(".typeName").text().slice(0,4),
          近1周: Number($($(IncreaseData[2]).find(".Rdata")[0]).text().replace(/%/g, '')),
          近1月: Number($($(IncreaseData[2]).find(".Rdata")[1]).text().replace(/%/g, '')),
          近3月: Number($($(IncreaseData[2]).find(".Rdata")[2]).text().replace(/%/g, '')),
          近6月: Number($($(IncreaseData[2]).find(".Rdata")[3]).text().replace(/%/g, '')),
          今年来: Number($($(IncreaseData[2]).find(".Rdata")[4]).text().replace(/%/g, '')),
          近1年: Number($($(IncreaseData[2]).find(".Rdata")[5]).text().replace(/%/g, '')),
          近2年: Number($($(IncreaseData[2]).find(".Rdata")[6]).text().replace(/%/g, '')),
          近3年: Number($($(IncreaseData[2]).find(".Rdata")[7]).text().replace(/%/g, '')),
        };
        fundUpDownData['csiAmout'] = {
          // typeName:$($(IncreaseData[3])).find(".typeName").text(),
          近1周: Number($($(IncreaseData[3]).find(".Rdata")[0]).text().replace(/%/g, '')),
          近1月: Number($($(IncreaseData[3]).find(".Rdata")[1]).text().replace(/%/g, '')),
          近3月: Number($($(IncreaseData[3]).find(".Rdata")[2]).text().replace(/%/g, '')),
          近6月: Number($($(IncreaseData[3]).find(".Rdata")[3]).text().replace(/%/g, '')),
          今年来: Number($($(IncreaseData[3]).find(".Rdata")[4]).text().replace(/%/g, '')),
          近1年: Number($($(IncreaseData[3]).find(".Rdata")[5]).text().replace(/%/g, '')),
          近2年: Number($($(IncreaseData[3]).find(".Rdata")[6]).text().replace(/%/g, '')),
          近3年: Number($($(IncreaseData[3]).find(".Rdata")[7]).text().replace(/%/g, '')),
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
      fundUrl += ("&code=" + code + "&sdate=" + sdate + "&edate=" + edate + "&per=49" + "&page=" + curpage);
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
          let sql = `REPLACE into funddata values('${fundData.fundCode}','${fundData.fundCode}','${fundData.fundName}','${fundData.fundNameShort}','${fundData.fundType}','${fundData.releaseDate}','${fundData.buildDate}','${fundData.assetScale}','${fundData.shareScale}','${fundData.administrator}','${fundData.custodian}','${fundData.manager}','${fundData.bonus}','${fundData.managementRate}','${fundData.trusteeshipRate}','${fundData.saleServiceRate}','${fundData.subscriptionRate}')`
          conn.query(sql, (err, result) => {
            if (err) {
              throw err
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
        concurrentCtrl.go(itemNum);
        if (itemNum >= codesLength) {
          if (errorItems.length > 0) {
            console.log(errorItems);
          }
        }
      });
      Event.on("error_fundItem", (_code) => {
        errorItems.push(_code);
        errorItemNum++;
      });
      Event.on("correct_fundItem", (_code) => {
        correctItems.push(_code)
        correctItemNum++;
      });
      concurrentCtrl.go(0);
    }
  }

  fundSave(_codesArray) {
    if (!_codesArray) {
      this.fetchFundCodes((err, codesArray) => {
        this.fundToSave(err, codesArray);
        this.fundToValSave(err, codesArray);
      })
    } else {
      _codesArray = Object.prototype.toString.call(_codesArray) === '[object Array]' ? _codesArray : [];
      if (_codesArray.length > 0) {
        this.fundToSave(null, _codesArray);
        this.fundToValSave(null, _codesArray);
      } else {
        console.log("not enough codes to fetch");
      }
    }
  }

  fundToValSave(err, codesArray) {
    if (!err) {
      let codesLength = codesArray.length;
      let itemNum = 0;
      let errorItems = [];
      let errorItemNum = 0;
      let correctItems = [];
      let correctItemNum = 0;

      let concurrentCtrl = new ConcurrentCtrl(this, this.fragmentSize, this.fundValSave, codesArray);
      Event.on("catch_TrendItem", (_code) => {
        itemNum++;
        concurrentCtrl.go(itemNum);
        if (itemNum >= codesLength) {
          if (errorItems.length > 0) {
            console.log(errorItems);
          }
        }
      });
      Event.on("error_TrendItem", (_code) => {
        errorItems.push(_code);
        errorItemNum++;
      });
      Event.on("correct_TrendItem", (_code) => {
        correctItems.push(_code)
        correctItemNum++;
      });
      concurrentCtrl.go(0);
    }
  }

  fundValSave(codesArray) {
    codesArray.map((code, index) => {
      this.fetchFundCodeInfo(code, (err, data) => {

        if (err) {
          Event.emit("error_TrendItem", codesArray[index]);
          Event.emit("catch_TrendItem", codesArray[index]);
        } else {
          // this.FilterFund(data, code);
          let sql1 = `replace fundstage values('${code}','阶段涨幅','${data.stageAmout.近1周}','${data.stageAmout.近1月}','${data.stageAmout.近3月}','${data.stageAmout.近6月}','${data.stageAmout.今年来}','${data.stageAmout.近1年}','${data.stageAmout.近2年}','${data.stageAmout.近3年}')`
          let sql2 = `replace fundstage values('${code}','同类平均','${data.averageAmout.近1周}','${data.averageAmout.近1月}','${data.averageAmout.近3月}','${data.averageAmout.近6月}','${data.averageAmout.今年来}','${data.averageAmout.近1年}','${data.averageAmout.近2年}','${data.averageAmout.近3年}')`
          let sql3 = `replace fundstage values('${code}','沪深300','${data.csiAmout.近1周}','${data.csiAmout.近1月}','${data.csiAmout.近3月}','${data.csiAmout.近6月}','${data.csiAmout.今年来}','${data.csiAmout.近1年}','${data.csiAmout.近2年}','${data.csiAmout.近3年}')`

          conn.query(sql1, (error, result) => {
            if (error) {
              Event.emit("catch_TrendItem", codesArray[index]);
            } else {
              conn.query(sql2, (err, res) =>{
                if(err) {
                  Event.emit("error_TrendItem", codesArray[index]);
                  Event.emit("catch_TrendItem", codesArray[index]);
                }else {
                  conn.query(sql3, (e, r) => {
                    if(e) {
                      Event.emit("error_TrendItem", codesArray[index]);
                      Event.emit("catch_TrendItem", codesArray[index]);
                    }else{
                      Event.emit("correct_TrendItem", codesArray[index]);
                      Event.emit("catch_TrendItem", codesArray[index]);
                    }
                  })
                }
              })
            }
          })
        }
      })
    })
  }

  fundSend(email) {
    let sql = `select userName from funduser where Email='${email}'`

    conn.query(sql , (err, res)=> {
      if(err) throw err
      if(res.length>0) {
        let username = res[0].userName
        this.TargetFundData(username, (data)=>{
          this.OptionFundData(username, async (data)=>{
            let html = `
              <div style="width: 80%;margin: 0 auto;">
              <h3>${new Date().toDateString()}</h3>
              <h5>爬取基金(近一周涨跌)</h5>`
            this.upFundArr.forEach((item) => {
              html += `<p>${item.fundName}: ${item.Trend}</p>`
            })
            this.downFundArr.forEach((item) => {
              html += `<p>${item.fundName}: ${item.Trend}</p>`
            })
            html += `<h5>自选基金(今日涨跌)</h5>`
            this.optionFundAll.forEach((item)=>{
              html += `<p>${item.fundName}: ${item.Trend}</p>`
            })
            html += `<a href="http://fund.huabyte.com" style="text-decoration: none;">查看详情</a>
            </div>`

            var user = "airhua_byte@163.com"; //自己的邮箱
            var pass = "KFSXWZEOTIWSVZCI"; //qq邮箱授权码,如何获取授权码请百度
            var to = email; //对方的邮箱
            let transporter = nodemailer.createTransport({
              host: "smtp.163.com",
              port: 465,
              secure: true,
              auth: {
                user: user, // 用户账号
                pass: pass, //授权码,通过QQ获取
              },
            });
            let info = await transporter.sendMail({
              from: `FundSpider<${user}>`, // sender address
              to: `<${to}>`, // list of receivers
              subject: "基金爬虫日报", // Subject line
              text: '', // plain text body
              html: html
            });
          })
        })
      }
    })
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

function fundFlagSort(data) {
  return data.sort(compare)
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

module.exports = FundSpider