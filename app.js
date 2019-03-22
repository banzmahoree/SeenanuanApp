const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express()
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const secretKey = "SeenanunRestaruan";


const result_failed = {
    result: "failed",
    data: ""
  };

const conn = mysql.createConnection({
     host:"us-cdbr-iron-east-03.cleardb.net",
     user:"b167b8ebec0a40",
     password:"c5f828ff",
     database:"heroku_0a3c46200a1ba85"
});


app.use(function (req,res,next){
   res.setHeader('Access-Control-Allow-Origin','*');
   res.setHeader('Access-Control-Allow-Method','GET,POST,PUT,DELETE');
   res.setHeader('Access-Control-Allow-Headers','*');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

function getToken(json){
    return token = jwt.sign(json,secretKey,{
        expiresIn:8640000
    })
}
function vertifyToken(req,res,next){
   console.log("Vertify Token"+JSON.stringify(req.header));
   token = req.headers['x-access-token'];
   if(!token)
     return res.status(403).send({auth:false,message:'No token'});
     jwt.verify(token,secretKey,function(err,decoded){
        if(err)
        return res.status(500).send({auth:false,message:'Failed to auth token'});
        req.userId = decoded.id;
        next();
     })
}


app.get('/',(req,res) =>{
   res.send("Hello you Complete");
})
app.get('/show',(req,res) => {
  var sql = `SELECT * FROM users`;
  conn.query(sql,function(err,result){
    if (err) {
      res.json(result_failed);
    }else{
     res.json(result);
     console.log(result);
    }
   });

})
app.post('/login',(req,res) =>{
  console.log(req.body);
  var sql = `SELECT
            id,username,password FROM users where username = '${req.body.username}'`;
            conn.query(sql,function (err,result) {
                if(err){
                    res.json(result_failed)
                }else{
                    if(result.length > 0){
                      const passwordIsvalid = bcrypt.compareSync(req.body.password,result[0].password);
                      if(!passwordIsvalid) return res.json(result_failed);

                      var _username = result[0].username;
                      var _id = result[0].id;

                      var token = getToken({id:_id,username:_username})
                      const finalResult ={
                          result:"success",
                          data:token
                      };
                      console.log(JSON.stringify(finalResult));
                      res.json(finalResult);
                    }else{
                        const finalResult = {
                            result:"failed",
                            data:""
                        };
                        console.log(JSON.stringify(finalResult));
                        res.json(finalResult);
                    }
                }
            });
});

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function () {
    console.log('run at port', app.get('port'));
});

module.exports = app;
