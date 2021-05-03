import { Component } from 'react';
import './Header.scss';

class Header extends Component {
  render() {
    return (
      <header>
        <h1><a href="#" onClick={function(e){
          console.log(e);
          e.preventDefault();
          this.props.onChangePage();
        }.bind(this)}>{this.props.title}</a></h1>
        <p>{this.props.sub}</p>
      </header>
    );
  }
}

export default Header;
