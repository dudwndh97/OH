import { Component } from 'react';
import './App.scss';
import Header from './components/Header'
import Nav from './components/Nav'
import Content from './components/Content'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode : "welcome",
      selected_content_id:2,
      subject:{title:'WEB', sub:'world wide web'},
      welcome:{title:'WELCOME', sub:'welcome ! welcome'},
      contents:[
        {id:1, title:'HTML', desc:'HTMLhtmlhtmlhtml'},
        {id:2, title:'CSS', desc:'csscsscsscsscss'},
        {id:3, title:'JAVASCRIPTS', desc:'javascriptssss'}
      ]
    }
  }
  render () {
    var _title, _sub = null;
    if(this.state.mode === "welcome") {
      _title = this.state.welcome.title;
      _sub = this.state.welcome.sub;
    } else if(this.state.mode === "read") {
      var i = 0;
      while(i < this.state.contents.length){
        var data = this.state.contents[i];
        if(data.id === this.state.selected_content_id) {
          _title = data.title;
          _sub = data.desc;
          break;
        }
        i = i + 1;
      }
    }
    return (
      <div className="App">
        <Header 
          title={_title} 
          sub={_sub} 
          onChangePage={function(){
            this.setState({mode:'read'})
          }.bind(this)}
        />
        <Nav 
        onChangePage={function(id){
          this.setState({
            mode:'read',
            selected_content_id:Number(id)
          });
          console.log(data);
        }.bind(this)}
          data={this.state.contents}
        />
        <Content text="subtit" sub="Lorem Ipsum333" />
        <Content text="Lorem Ipsum2" sub="sub" />
      </div>
    );    
  }
}

export default App;
