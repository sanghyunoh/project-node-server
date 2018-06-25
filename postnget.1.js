
var mysql = require("mysql");
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var mime = require('mime');
var fs = require('fs');

module.exports = function(app, pool) {
    //SalesProductEnrollmentManager 구현
    app.post("/registerproductlist", function(req, res) {
        var result = {};
        var array = req.body;
        var mes = "";
        var productname = array["productname"];
        var price = array["price"];
        var count = array["count"];
        var option1 = array["option1"];
        var option1price = array["option1price"];
        var option2 = array["option2"];
        var option2price = array["option2price"];
        var option3 = array["option3"];
        var option3price = array["option3price"];
        var totalorder = "0";
        // 상기동일
        var attr = req.body.attr;
        
            // db에 연결하여 sql 수행
            if (productname == undefined) {
            result = returnResult(new Error("2"+result), res);
            }
            var productid = "";
            pool.getConnection(function(err, conn) {
                // title 정보를 DB에 넣기 위한 SQL문 준비
                var sql1 = "select productid from productinfo order by productid desc limit 1;";
                
                var query = conn.query(sql1, function(err, result) {
                    
                    productid = parseInt(result[0].productid) + parseInt("1");
                    mes = productid;
                    console.log(mes);
                    
                var sql = "INSERT INTO productinfo (productid, productname, price, count, option1, option1price, option2, option2price, option3," +
                "option3price, totalorder) VALUES ('" + productid + "', '" + productname + "', '" + price + "', '" + count + "', '" + option1 + "'," +
                "'" + option1price + "', '" + option2 + "', '" + option2price + "', '" + option3 + "', '" + option3price + "', '" + totalorder +"');";
                conn.query(sql, function(err) {
                    // err가 떠도 conn은 release() 꼭 해주어야한다
                    
                    result = returnResult(err, res);
                    result.message = mes.toString();
                    result.status = res.statusCode;
                    res.send(result);
                    conn.release();
                    
                });
                });
                
            });
            
        });
    
    //productDetailPageManager 구현
    app.get("/getproductlist", function(req, res) {
	    var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from productinfo;";
            conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    result.message = rows;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });
    
    //CorrectionSalesProductManager
    var async = require("async");
    app.put("/correctionproduct/:productid", function(req, res) {
        var productid = req.params.productid;
	    var array = req.body;
        var productname = array["productname"];
        var price = array["price"];
        var count = array["count"];
        var option1 = array["option1"];
        var option1price = array["option1price"];
        var option2 = array["option2"];
        var option2price = array["option2price"];
        var option3 = array["option3"];
        var option3price = array["option3price"];
        var result = {};
        async.waterfall([
        function(callback) {
            callback();
        },
        function(callback) {
            if (productid == undefined) {
                
            }
            else {
                // db에 연결하여 sql 수행
                pool.getConnection(function(err, conn) {
                    // title 정보를 업데이트 하기 위한 SQL
                    var sql = "UPDATE productinfo SET productname='" + productname + "', count='" + count + "', price='" + price +
                    "', option1='" + option1 + "', option1price='" + option1price + "', option2='" + option2price + "', option2='" + option2 +
                    "', option3='" + option3 +"', option3price='" + option3price +"' WHERE productid='" + productid + "';";
                            
                    console.log("SQL: " + sql);
                    conn.query(sql, function(err) {
                        if (err) {
                            // err가 떠도 conn은 release() 꼭 해주어야한다.
                            conn.release();
                            callback(err);
                        } else {
                            conn.release();
                            callback();
                        }
                    });
                });
            }
        }],
        function(err) {
            result = returnResult(err, res)
            result.message = "Success";
            result.status = res.statusCode;
            res.send(result);
        });
    });

    //SalesProductEnrollmentManager_Image
    app.post('/upload/:productid', upload.single('userfile'), function(req, res){
        var filename = req.file.filename;
        var productid = req.params.productid;
        
        fs.rename('./uploads/'+filename, './uploads/' + productid + ".png", function (err) {
            var result = {};
            if (err){
                console.log('renamed fail');
                result.isSuccess = '0';
                res.send(result);
                console.log("실패");
            }
            else{
                result.isSuccess = '1';
                res.send(result);
                console.log("성공");
            }
        });
    });

    //ProductDetailPageManager_view_Image부분
    app.get('/images/:productid', function(req, res){
        fs.readFile('./uploads/'+ req.params.productid+ ".png", function(err, data) {
            if(err){
                var result = {};
                result.isSuccess = '0';
                res.send(result);
            }
            else{
                res.writeHead(200, {'Content-Type': 'image/png'});
                res.write(data);
                res.end();
            }
            
            
        });
    });
    
    //OrderManager 구현
    //성공하면 isSuccess 1 아니면 0
    app.post("/order", function(req, res) {
        var result = {};
        var array = req.body;
        var productid = array["productid"];
        var productname = array["productname"];
        var count = array["count"];
        var option1 = array["option1"];
        var option2 = array["option2"];
        var option3 = array["option3"];
        var totalPrice;
        //주문시간 추가

        //var newDate = new Date();
        var dateFormat = require('dateformat');
        var orderdate = dateFormat(new Date(), "yyyy-mm-dd");
        if (productid == undefined) {
            result = returnResult(new Error("2"+result), res);
            result.isSuccess = '2';
        }
        else {
            pool.getConnection(function(err, conn) {
                var sql = "SELECT * from productinfo WHERE productid=\"" +  productid + "\" ;";
                conn.query(sql, function(err, rows) {
                    if (rows) {
                        if(rows[0] == null){
                            result = returnResult(err, res);
                            result.isSuccess = "2";
                            console.log("쿼리실패");
                            res.send(result);
                            conn.release();
                        }
                        else{
                            if(rows[0].count < count){
                                result = returnResult(err, res);
                                result.isSuccess = "0";
                                console.log("재고부족");
                                res.send(result);
                                conn.release();
                            }
                            else{
                                var result = {};
                                var sql = "UPDATE productinfo SET count='" + (rows[0].count - count) +"' WHERE productid='" + productid + "';";
                                conn.query(sql, function(err) {
                                    if(err){
                                        console.log("에러");
                                    }
                                });
                                totalPrice = parseInt(rows[0].price);
                                if(rows[0].option1 != null && rows[0].option1 != ""){
                                    totalPrice += parseInt(rows[0].option1price);
                                }
                                if(rows[0].option2 != null && rows[0].option2 != ""){
                                    totalPrice += parseInt(rows[0].option2price);
                                }
                                if(rows[0].option3 != null && rows[0].option3 != ""){
                                    totalPrice += parseInt(rows[0].option3price);
                                }
                                totalPrice *= parseInt(count);
                                
                                var sql = "INSERT INTO salesinfo (productID, productname, count, option1, option2, option3, price, orderdate) VALUES ('" +
                                productid + "', '" + productname + "', '" + count +"', '" + option1 +"', '" + option2 + "', '" + option3 + "', '"  + totalPrice + "', '" + orderdate + "');"
                                "select totalorder from productinfo where productid= \"" + productid + "\";";
                                conn.query(sql, function(err, rows) {
                                });
                                    var array = rows;
                                    var totalorder = rows[0]["totalorder"];
                                    console.log(totalorder);
                                    var totalordervar = parseInt(totalorder) + parseInt(count);
                                    var sql2 = "UPDATE productinfo SET totalorder = '"+ totalordervar +"' where productid= \"" + productid +"\";";
                                    console.log(totalordervar);
                                    conn.query(sql2, function(err) {
                                    });
                                    
                                    if(err){
                                        console.log("에러");
                                    }

                                
                                result = returnResult(err, res);
                                result.isSuccess = "1";
                                console.log("성공");
                                res.send(result);
                                conn.release();
                            }
                        }//res.send(result);
                    }
                    else{
                        result = returnResult(err, res);
                        result.isSuccess = "2";
                        console.log("실패");
                        res.send(result);
                        conn.release();
                    }
                    //conn.release();
                });
            });
        }
    });
    
    //OrderedProductListManager
     app.get("/orderinfo",function(req,res){
         var result = {};
         pool.getConnection(function(err, conn) {
             var sql = "SELECT * from salesinfo;";
        	 conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    result.message = rows;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
     });
     
     //OrderedProductListManager By Date
     app.post("/orderinfobydate",function(req,res){
         var result = {};
         var array = req.body;
         var startdate = array["startdate"];
         var enddate = array["enddate"];
         pool.getConnection(function(err, conn) {
             var sql = "SELECT * from salesinfo where orderdate between '" + startdate + "' AND '" + enddate +"';";
        	 conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    result.message = rows;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
     });
    

 // LoginManager
 // 앱에서 서버로 ID, PW 주고 서버에서 비교후 결과값 전송
 // 소비자인 경우 1 리턴, 판매자인 경우 2리턴 아이디랑 비밀번호가 틀렸을 경우 3리턴 그 외의 경우 4리턴
    // >> GET/id
    app.get("/login/id/:id/pw/:pw", function(req, res) {
        var result = {};
        var id = req.params.id;
        var pw = req.params.pw;
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from userinfo WHERE id=" + id + ";";
        	conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    if(rows[0] == null){
                        result.message = "4";
                    }
                    else{
                    if(rows[0].pw == pw){
                        result.message = rows[0].attr;
                    }
                    else if(rows[0].pw != pw){
                        result.message = "3";
                    }
                    else
                        result.message = "5";
                    }
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });
    
    //제품 전체 리스트 재고량순 주기
    // >> GET
    app.get("/searchproductallbycount", function(req, res) {
	var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from productinfo order by totalorder desc;";
        	//select productid from productinfo order by productid desc limit 1;
            conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    var resultArray = new Array;
                    for(var x = 0; x<rows.length; x++){
                    var tempresultArray = new Array;
                    tempresultArray = ["productid", rows[x]["productid"], "productname",  rows[x]["productname"]
                    , "price",  rows[x]["price"], "count",  rows[x]["count"]];
                    resultArray.push(tempresultArray);
                    }
                    result.message = resultArray;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });   
    
     //제품 전체 리스트 최신순 주기
    // >> GET
    app.get("/searchproductallbyrecent", function(req, res) {
	var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from productinfo order by productid desc;";
        	//select productid from productinfo order by productid desc limit 1;
            conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    var resultArray = new Array;
                    for(var x = 0; x<rows.length; x++){
                    var tempresultArray = new Array;
                    tempresultArray = ["productid", rows[x]["productid"], "productname",  rows[x]["productname"]
                    , "price",  rows[x]["price"], "count",  rows[x]["count"]];
                    resultArray.push(tempresultArray);
                    }
                    result.message = resultArray;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });   
    
    //제품 전체 리스트
    // >> GET
    app.get("/searchproductall", function(req, res) {
	var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from productinfo;";
            conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    var resultArray = new Array;
                    for(var x = 0; x<rows.length; x++){
                    var tempresultArray = new Array;
                    tempresultArray = ["productid", rows[x]["productid"], "productname",  rows[x]["productname"]
                    , "price",  rows[x]["price"], "count",  rows[x]["count"]];
                    resultArray.push(tempresultArray);
                    }
                    result.message = resultArray;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });
    
    //productSearchManager 구현
     //제품 이름으로 검색하기
    app.post("/searchbyname", function(req, res) {
    var array = req.body;
    var name = array["name"];
	var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from productinfo WHERE productname like '%" + name + "%';";
        	console.log(name);
            conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    var resultArray = new Array;
                    for(var x = 0; x<rows.length; x++){
                    var tempresultArray = new Array;
                    tempresultArray = ["productid", rows[x]["productid"], "productname",  rows[x]["productname"]
                    , "price",  rows[x]["price"], "count",  rows[x]["count"]];
                    resultArray.push(tempresultArray);
                    }
                    result.message = resultArray;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });
    
    //productSearchManager 구현
     //제품 이름으로 검색하기 주문많은순
    app.post("/searchbytotalorder", function(req, res) {
    var array = req.body;
    var name = array["name"];
	var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from productinfo WHERE productname like '%" + name + "%' order by totalorder desc;";
        	console.log(name);
            conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    var resultArray = new Array;
                    for(var x = 0; x<rows.length; x++){
                    var tempresultArray = new Array;
                    tempresultArray = ["productid", rows[x]["productid"], "productname",  rows[x]["productname"]
                    , "price",  rows[x]["price"], "count",  rows[x]["count"]];
                    resultArray.push(tempresultArray);
                    }
                    result.message = resultArray;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });
	
	//productSearchManager 구현
     //제품 이름으로 검색하기 최신순
    app.post("/searchbyrecent", function(req, res) {
    var array = req.body;
    var name = array["name"];
	var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from productinfo WHERE productname like '%" + name + "%' order by productid desc;";
        	//"select productid from productinfo order by productid desc limit 1
        	console.log(name);
            conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    var resultArray = new Array;
                    for(var x = 0; x<rows.length; x++){
                    var tempresultArray = new Array;
                    tempresultArray = ["productid", rows[x]["productid"], "productname",  rows[x]["productname"]
                    , "price",  rows[x]["price"], "count",  rows[x]["count"]];
                    resultArray.push(tempresultArray);
                    }
                    result.message = resultArray;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
    });
	
	
    //제품상세페이지용
    //productDetailPageManager
     app.get("/detailinfo/:productid",function(req,res){
         var result = {};
         var productid = req.params.productid;
         pool.getConnection(function(err, conn) {
             var sql = "SELECT * from productinfo WHERE productid='"+ productid+ "';";
        	 conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    result.message = rows;
                }
                conn.release();
                result.status = res.statusCode;
                res.send(result);
            });
        });
     });
    //제품삭제
    app.get("/deleteproduct/:productid",function(req,res){
         var result = {};
         var productid = req.params.productid;
         pool.getConnection(function(err, conn) {
             var sql = "DELETE from productinfo WHERE productid='"+ productid+ "';";
        	 conn.query(sql, function(err, rows) {
                var result = returnResult(err, res);
                if (rows) {
                    result.message = rows;
                }
                conn.release();
                result.message = productid;
                result.status = res.statusCode;
                res.send(result);
            });
        });
     });
};
 
var returnResult = function(err, res) {
    // 결과를 눈으로 보기 쉽게하기 위해 result 객체 생성
    var result = {};
    if (err) {
        res.status(400);
    } else {
        res.status(200);
    }
    return result;

};
