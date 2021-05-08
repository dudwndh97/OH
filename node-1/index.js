const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const { User } = require("./models/User");
const config = require('./config/key');

//application/x-www-form-urlencoded 을 분석해서 가져오게함
app.use(bodyParser.urlencoded({extended:true}))

//application/json을 분석해서 가져오게함
app.use(bodyParser.json());
app.use(cookieParser());

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

app.post('/login', (req,res) => {
  //1.요청된 이메일을 데이터베이스에서 찾는다.
  User.findOne({email:req.body.email}, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    } 
    //2.데이터베이스에 있다면 이메일과 비밀번호가 일치하는지 검사
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
        return res.json({loginSuccess:false, message:"비밀번호가 틀렸습니다."})
  
      //3.비밀번호까지 맞다면 token을 생성하기.
      user.genarateToken((err, user) => {
        if(err) return res.status(400).send(err);
        //토큰을 저장한다. 어디에? 쿠키에 
        res.cookie("x_auth", user.token)
        .status(200)
        .json({loginSuccess:true, userId: user._id})
      })
    })
  })
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
