import React, { useEffect } from 'react'
import axios from 'axios'; //fe의 로그인 값을 backend로 보내주는 라이브러리

function Home() {

  useEffect(() => {
    axios.get('/api/hello')
    .then(response => console.log(response.data))
  }, [])
  return (
   <div>
     Home
   </div>
  )
}

export default Home;