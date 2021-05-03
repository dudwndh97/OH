import { Component } from 'react';
import './Content.scss';

class Content extends Component {
  render() {
    return(
      <>
      <p>{this.props.text}</p>
      <span>{this.props.sub}</span>
      </>
    );
  }
}

export default Content;
