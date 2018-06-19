/*
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  port     : '',
  database : 'server_db'
});
*/
var express    = require('express');
var mysql      = require('mysql');
var dbconfig   = require('./config/database.js');
var connection = mysql.createConnection(dbconfig);
var bodyParser = require("body-parser");
var app = express();

// bodyParser는 미들웨어이기 때문에 라우터 보다 항상 위에 있도록 해야함
app.use(bodyParser.json());     
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({extended: false}));
 
// Mysql DB pool 생성
var pool = mysql.createPool({
            // config.js에 있는 정보를 바탕으로 연결
            host: dbconfig.mysql.host,
            port: dbconfig.mysql.port,
            user: dbconfig.mysql.username,
            password: dbconfig.mysql.password,
            database: dbconfig.mysql.db,
            connectionLimit:20,
            waitForConnections:false
        });
 
// Main
app.listen(dbconfig.port, function() {
    console.log("Server listening on port %d", dbconfig.port);
});
 
// Router
// 기본으로 index.js를 찾기 때문에 
// require("./routes/index.js")라고 명시
var routes = require("./postnget.js")(app, pool);
