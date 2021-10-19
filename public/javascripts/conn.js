const mysql = require('mysql');

// 创建数据库连接对象
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'fund',
  useConnectionPooling: true
})

// 连接数据库
conn.connect((err,res)=>{
  if(err) throw err;
  console.log('数据库连接成功');
})

// 当数据库发生异常
conn.on('error', (err)=>{
  if (err.code = 'PROTOCOL_CONNECTION_LOST') {
    console.log('数据库连接中断')
    conn.connect()
  }else {
    console.error(err.stack || err);
  }
})

module.exports = conn
