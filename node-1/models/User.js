const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10; //salt를 10자리로 만듦.
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim:true, //space를 없애주는 역할
    unique:1
  },
  password: {
    type: String,
    maxlength:100
  },
  role: {
    type: Number, //ex)1 : admin , 2: user,
    default: 0,
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: { //token 유효기간
    type: Number  
  }
})

userSchema.pre('save', function (next) {
  var user = this;
  if(user.isModified('password')) { //isModified('?') = ?가 변경될 때
    //비밀번호를 암호화 시킨다
    bcrypt.genSalt(saltRounds, function(err, salt){
  
      if(err) return next(err) //에러가 나면 err로 이동
  
      bcrypt.hash(user.password, salt, function(err, hash) {
        if(err) return next(err)
        user.password = hash
        next() //pre('save', function(){})이기 때문에 끝나면 save를 마저 진행한다.
      })
    })
  } else {
    next()
  }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
  //plainPassword 1234567
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if(err) return cb(err);
    cb(null, isMatch)
  })
}

userSchema.methods.genarateToken = function(cb) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), 'secretToken')
  // user._id + 'secretToken' = token
  // ->
  // 'secretToken' -> user._id

  user.token = token
  user.save(function(err, user) {
    if(err) return cb(err);
    cb(null, user)
  })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }