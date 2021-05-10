import React from 'react'
import {
  Link
} from "react-router-dom";
function NavBar() {
  return (
   <div>
     <ul>
       <li><Link to="/">Home</Link></li>
       <li><Link to="/login">Log in</Link></li>
       <li><Link to="/signin">Sign in</Link></li>
     </ul>
     
   </div>
  )
}

export default NavBar;