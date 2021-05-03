import { Component } from 'react';
import './Nav.scss';

class Nav extends Component {
  render() {
    var List = [];
    var data = this.props.data;
    var i = 0;
    while(i < data.length) {
      List.push(<li className="nav-item" key={data[i].id}><a href={"/content/" + data[i].id}><h2>{data[i].title}</h2><p>{data[i].desc}</p></a></li>);
      i = i + 1;
    }
    return(
      <nav className="nav">
        <ul> 
          {List}
        </ul>
      </nav>
    );
  }
}

export default Nav;
