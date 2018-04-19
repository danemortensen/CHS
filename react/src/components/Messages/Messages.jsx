import React, { Component } from 'react';
import {
   ListGroup, ListGroupItem, FormGroup, ControlLabel, FormControl, HelpBlock,
   Button
} from 'react-bootstrap';

function FieldGroup({ id, label, help, ...props }) {
   return (
      <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
         {help && <HelpBlock>{help}</HelpBlock>}
      </FormGroup>
   );
}

class Message extends Component {
   constructor(props) {
      super(props);
      this.state = { show: true };
   }

   convertTime(unixTime) {
      return new Intl.DateTimeFormat('en-us').format(new Date(unixTime));
   }

   render() {
      return (
         <ListGroupItem>
            <div className="clearfix" onClick={() => {
                this.state.show ?
                   this.setState({ show: false })
                :
                   this.setState({ show: true })
             }}>
               <h3 className="pull-left">{this.props.email}</h3>
               <h3 className="pull-right">
                  {this.convertTime(this.props.whenMade)}
               </h3>
            </div>
            {this.state.show ?
               [
               <p key='content'>{this.props.content}</p>
               ]
            :
               [
               ''
               ]
            }
            
         </ListGroupItem>
      );
   }
}

class Messages extends Component {
   constructor(props) {
      super(props);
      this.state = { content: '' };
      this.handleChange = this.handleChange.bind(this);
   }

   componentWillMount() {
      this.props.getMsgs(this.getCnvId());
   }

   handleChange(ev) {
      let newState = {};

      newState[ev.target.id] = ev.target.value;
      this.setState(newState);
   }

   getCnvId() {
      let url = window.location.href.split('/');

      return url[url.length - 1];
   }

   formValid() {
      return this.state.content;
   }

   render() {
      console.log('rendering MESSAGES');
      return (
         <div>
            <h1>Messages</h1>

            <ListGroup>
               {this.props.Msgs.map((msg) =>
                  <Message key={msg.content + msg.whenMade} email={msg.email}
                   whenMade={msg.whenMade} content={msg.content} />)}
            </ListGroup>

            <form>
               <FieldGroup id="content" type="text" label="New Message"
                placeholder="Enter new message" value={this.state.content}
                required={true} onChange={this.handleChange} />
            </form>
            <Button bsStyle="primary" disabled={!this.formValid()}
             onClick={() => {
                this.props.postMsg(this.getCnvId(),
                 { content: this.state.content });
                console.log(this.getCnvId());
                console.log(this.state.content);
                this.setState({ content: '' });
             }}>
               Send
            </Button>
         </div>
      );
   }
}

export default Messages;