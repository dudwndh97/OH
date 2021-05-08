if(process.env.NODE_ENV === 'production') { //process.env.NODE_ENV = 서버 환경 변수
  module.exports = require('./prod'); 
} else {
  module.exports = require('./dev');
}