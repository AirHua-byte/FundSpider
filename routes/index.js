var express = require('express');
var router = express.Router();
var crypto = require('crypto');
const schedule = require("node-schedule"); // 定时器

const conn = require('../public/javascripts/conn.js')
const FundSpider = require('../public/javascripts/spider.js');

// 定义工具爬虫实例
let fundSpider = new FundSpider(20)
// 设置每天0点爬取数据存入数据库
schedule.scheduleJob({
  hour: 00,
  minute: 00
},()=>{
  fundSpider.fundSave()
})
// 设置每天12点发送基金日报
schedule.scheduleJob({
  hour: 12,
  minute: 00
},()=>{
})
let sql = `select Email from funduser`
conn.query(sql, (err,res)=>{
  if(err) throw err
  if(res.length > 0) {
    res.forEach((item) => {
      if(item.Email) {
        let f = new FundSpider()
        f.fundSend(item.Email)
      }
    });
  }
})

// 解决跨域
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

router.get('/', function (req, res) {
  res.send(`<h3>请访问以下形式的路径获取信息：</h3>
      <div>/fetchFundCodes</div>
      <div>/fetchFundInfo/:code</div>
      <div>/fetchFundData/:code/:stage</div></br>
      <span>建议自建一套前端环境，以上只做服务接口用</span>`);
});

// 爬取基金代码
router.get('/fetchFundCodes', (req, res) => {
  let fundSpider = new FundSpider();
  fundSpider.fetchFundCodes((err, data) => {
    res.send(data.toString());
  });
});
// 爬取基金详情信息
router.get('/fetchFundInfo/:code', (req, res) => {
  let fundSpider = new FundSpider();
  fundSpider.fetchFundInfo(req.params.code, (err, data) => {
    res.send(JSON.stringify(data));
  });
});
// 爬取基金阶段日涨跌情况
router.get('/fetchFundData/:code/:stage', (req, res) => {
  let fundSpider = new FundSpider();
  fundSpider.fetchFundData(req.params.code, req.params.stage, (err, data) => {
    res.send(JSON.stringify(data));
  });
});
// 获取基金阶段涨幅
router.get('/Fundstage/:code', (req, res) => {
  let fundSpider = new FundSpider();
  fundSpider.fetchFundCodeInfo(req.params.code, (err, data) => {
    res.send(JSON.stringify(data));
  });
});
// 注册接口
router.post('/register', (req, res) => {
  let registerInfo = req.body
  registerInfo.password = crypto.createHmac('sha256', registerInfo.password)
    .update('secret password')
    .digest('hex')

  conn.query(`select * from funduser where userName='${registerInfo.username}'`,(error, re)=>{
    if (error) throw error
    if(re.length>0) {
      res.send('rregister')
    }else {
      let sql = `insert into funduser values('${registerInfo.username}','${registerInfo.password}','')`
      conn.query(sql, (err, r) => {
        if(err) {
          res.send(err)
        }else {
          res.send('success')
        }
      })
    }
  })
})
// 登入接口
router.post('/login', (req, res) => {
  let loginInfo = req.body
  loginInfo.password = crypto.createHmac('sha256', loginInfo.password)
    .update('secret password') // 盐
    .digest('hex')

  conn.query(`select * from funduser where userName='${loginInfo.username}' and passWord='${loginInfo.password}'`,(error,rs)=>{
    if (error) throw error
    if(rs.length>0) {
      res.cookie('username',loginInfo.username,{maxAge:1000*3600*24*7});
      res.send({
        username: loginInfo.username
      })
    }else {
      res.send('error')
    }
  })
})
router.get('/logout', (req, res) => {
  res.clearCookie('username')
  res.send('OK')
})
// 发送目标基金
router.get('/fundtarget', (req, res) => {
  let username = req.query.username
  let fundSpider = new FundSpider();
  fundSpider.TargetFundData(username, (data)=>{
    res.send(data)
  })
});
// 发送自选基金信息
router.get('/optiontarget', (req, res) => {
  let username = req.query.username
  let fundSpider = new FundSpider()
  fundSpider.OptionFundData(username, (data)=>{
    res.send(data); 
  })
});
// 返回规则
router.get('/currentrule',(req, res) => {
  let username = req.query.username
  let sql = `select * from fundrule where userName='${username}'`

  conn.query(sql, (err,rs) => {
    if(err) throw err
    if(rs.length > 0) {
      res.send(rs[0])
    }
  })
})
// 接收规则
router.get('/rules', (req, res) => {
  let rules = JSON.parse(req.query.rules)
  let RisingFund = rules.RisingFund
  let FallingFund = rules.FallingFund
  let username = req.query.username
  let sql1 = `select * from fundrule where userName='${username}'`
  conn.query(sql1, (err,rs)=>{
    if(err) throw err
    if(rs.length>0) {
      let rules = rs[0]
      let RisingOneweek = Number(RisingFund['oneweek'] == '' ? rules.risingOneweek:RisingFund['oneweek'])
      let RisingOnemonth = Number(RisingFund['onemonth'] == '' ? rules.risingOnemonth:RisingFund['onemonth'])
      let RisingThreemonth = Number(RisingFund['threemonth'] == '' ? rules.risingThreemonth:RisingFund['threemonth'])
      let RisingSixmonth = Number(RisingFund['sixmonth'] == '' ? rules.risingSixmonth:RisingFund['sixmonth'])
      // let RisingFromyear = Number(RisingFund['oneweek'] == '' ? rules.risingFromyear:RisingFund['oneweek'])
      let RisingOneyear = Number(RisingFund['oneyear'] == '' ? rules.risingOneyear:RisingFund['oneyear'])
      // let RisingTwoyear = Number(RisingFund['oneweek'] == '' ? rules.risingTwoyear:RisingFund['oneweek'])
      let RisingThreeyear = Number(RisingFund['threeyear'] == '' ? rules.risingThreeyear:RisingFund['threeyear'])
      let FallingOneweek = Number(FallingFund['oneweek'] == '' ? rules.fallingOneweek:FallingFund['oneweek'])
      let FallingOnemonth = Number(FallingFund['onemonth'] == '' ? rules.FallingOnemonth:FallingFund['onemonth'])

      let sql2 = `update fundrule set risingOneweek=${RisingOneweek},
        risingOnemonth=${RisingOnemonth},
        risingThreemonth=${RisingThreemonth},
        risingSixmonth=${RisingSixmonth},
        risingOneyear=${RisingOneyear},
        risingThreeyear=${RisingThreeyear},
        fallingOneweek=${FallingOneweek},
        FallingOnemonth=${FallingOnemonth}
        where userName='${username}'`

      conn.query(sql2, (error, reslut)=>{
        if(error) throw error
        res.send('success');
      })
    }
  })
});
// 接收自选基金
router.get('/addoption', (req, res) => {
  let fundSpider = new FundSpider()
  let username = req.query.username
  let code = req.query.code
  
  // 查询自选表是否已存在
  let sql1 = `select * from fundoption where userName='${username}' and fundCode='${code}'`
  // 自选表没有 执行插入语句
  let sql2 = `insert into fundoption values('${username}','${code}')`

  conn.query(sql1, (error, result)=>{
    if(error) throw error
    if (result.length>0){
      res.send('repeat')
    }else {
      conn.query(sql2, (err, rs)=>{
        if(err) throw err
        fundSpider.OptionFundData(username, (data)=>{
          res.send(data); 
        })
      })
    }
  })
});
// 移除自选基金
router.get('/removeoption', (req, res) => {
  let fundSpider = new FundSpider()
  let username = req.query.username
  let code = req.query.code

  // 删除数据库该条自选记录
  let sql = `delete from fundoption where userName='${username}' and fundCode='${code}'`

  conn.query(sql, (error,reslut)=>{
    if(error) throw error
    fundSpider.OptionFundData(username, (data)=>{
      res.send(data); 
    })
  })
});
// 订阅邮箱报表
router.get('/subscribe', (req, res) => {
  let username = req.query.username
  let email = req.query.email
  let sql = `update funduser set Email='${email}' where userName='${username}'`

  conn.query(sql,(err, rs) => {
    if(err) throw err
    res.send('OK')
  })
})
// 获取是否订阅
router.get('/issubscribe', (req, res) => {
  let username = req.query.username
  let sql = `select Email from funduser where userName='${username}'`

  conn.query(sql,(err, rs) => {
    if(err) throw err
    console.log(rs)
    if(rs[0].Email != '') {
      res.send('YES')
    }else{
      res.send('NO')
    }
  })
})
// 取消订阅
router.get('/unsubscribe', (req, res)=>{
  let username = req.query.username
  let sql = `update funduser set Email='' where userName='${username}'`

  conn.query(sql,(err, rs) => {
    if(err) throw err
    res.send('OK')
  })
})

module.exports = router;
