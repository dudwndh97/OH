import { Component } from 'react';
import './Nav.scss';

class Nav extends Component {
  render() {
    var List = [];
    var data = this.props.data;
    var i = 0;
    while(i < data.length) {
      List.push(
      <li className="nav-item" key={data[i].id}>
        <a 
        href={"/content/" + data[i].id}
        data-id={data[i].id}
        onClick={function(e){
          e.preventDefault();
          this.props.onChangePage(e.target.dataset.id);
        }.bind(this)}
        >
          <h2>{data[i].title}</h2><p>{data[i].desc}</p>
        </a>
      </li>);
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
