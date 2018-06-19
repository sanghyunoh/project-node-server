var mysql = require("mysql");
 
module.exports = function(app, pool) {
    // >> POST
    app.post("/posttest", function(req, res) {
        var result = {};
        // 요청된 데이터 중 id이라는 놈을 뽑아 id이라고 명명.
        var id = req.body.id;
        // 상기동일
        var attr = req.body.attr;
        // title에 아무 값이 없다면 에러 발생시킴
        if (id == undefined) {
            result = returnResult(new Error("id is empty."+result), res);
        }
        else if(attr = undefined){
            result = returnResult(new Error("attr is empty."), res);
            }else {
            // db에 연결하여 sql 수행
            pool.getConnection(function(err, conn) {
                // title 정보를 DB에 넣기 위한 SQL문 준비
                var sql = "INSERT INTO logininfo (id, attr) VALUES ('" + id + "', '" + attr + "');";
                conn.query(sql, function(err) {
                    // err가 떠도 conn은 release() 꼭 해주어야한다.
                    result = returnResult(err, res);
                    conn.release();
                });
            });
        }
        result.status = res.statusCode;
        res.send(result);
    });
 
    // >> GET
    app.get("/gettest", function(req, res) {
	var result = {};
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from logininfo;";
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

    // >> GET/id
    app.get("/gettest/:id", function(req, res) {
        var result = {};
        // SQL injection attack 방지위해 mysql.escape();
        var id = mysql.escape(req.params.id);
        
        // db에 연결하여 sql 수행
        pool.getConnection(function(err, conn) {
        	var sql = "SELECT * from logininfo WHERE id=" + id + ";";
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

}
 
var returnResult = function(err, res) {
    // 결과를 눈으로 보기 쉽게하기 위해 result 객체 생성
    var result = {};
    if (err) {
        res.status(400);
        result.message = err.stack;
    } else {
        res.status(200);
        result.message = "Success";
    }
    return result;
}

