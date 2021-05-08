const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const { User } = require("./models/User");
const config = require('./config/key');

//application/x-www-form-urlencoded 을 분석해서 가져오게함
app.use(bodyParser.urlencoded({extended:true}))

//application/json을 분석해서 가져오게함
app.use(bodyParser.json());

const mongoose = require( 'mongoose')
mongoose.connect( config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('mongoDB Connected....'))
  .catch(err => console.log(err))

app.get('/', (req, res) => res.send('방가워용ㅎㅎ'))

app.post('/register', (req, res) => {
  //회원가입 할 때 필요한 정보들을 client에서 가져오면 
  //그것들을 데이터베이스에 넣어준다.

  const user = new User(req.body); //req.body 는 body-parser의 명령어

  user.save((err, userInfo) => {
    if(err) return res.json({success:false, err}) // 전송에 실패 했을때.
    return res.status(200).json({ //status(200) = 성공했다는 뜻
      success:true
    })
  })

})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
