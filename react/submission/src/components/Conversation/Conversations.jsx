import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ConfDialog } from '../index';
import {
   ListGroup, ListGroupItem, ButtonToolbar, Button, Glyphicon, FormGroup,
   ControlLabel, FormControl, HelpBlock
} from 'react-bootstrap';

// TODO: import own CSS

function FieldGroup({ id, label, help, ...props }) {
   return (
      <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
         {help && <HelpBlock>{help}</HelpBlock>}
      </FormGroup>
   );
}

function Conversation(props) {
   return (
      <ListGroupItem>
         <div className="clearfix">
            <Link to={`/CnvDetail/${props.id}`}>
               <div className="pull-left">
                  <h2>{props.title}</h2>
                  <p>{props.convertTime(props.lastMessage)}</p>
               </div>
            </Link>
            {props.ownerId === props.prsId || props.admin ?
               [
                  <ButtonToolbar key='buttons' className="pull-right">
                     <Button bsStyle="info" onClick={props.setEdit} >
                        <Glyphicon glyph="pencil" />
                     </Button>
                     <Button bsStyle="danger" onClick={props.setDelete}>
                        <Glyphicon glyph="trash" />
                     </Button>
                  </ButtonToolbar>
               ]
            :
               [
                  ''
               ]
            }
         </div>
      </ListGroupItem>
   );
}

class Conversations extends Component {
   constructor(props) {
      super(props);
      this.state = {};
      this.handleChange = this.handleChange.bind(this);
   }

   componentWillMount() {
      this.props.getCnvs();
   }

   handleChange(ev) {
      let newState = {};

      newState[ev.target.id] = ev.target.value;
      this.setState(newState);
   }

   getLocation() {
      let url = window.location.href.split('/');

      return url[url.length - 1];
   }

   convertTime(unixTime) {
      return (unixTime
       && new Intl.DateTimeFormat('en-us').format(new Date(unixTime)))
       || 'No messages';
   }

   render() {
      return (
         <div>
            <h1>All Conversations</h1>
            <ListGroup>
               {this.props.Cnvs.map((cnv) =>
                  this.getLocation() === 'myCnvs'
                   && cnv.ownerId !== this.props.Prss.id ?
                      [
                      ''
                      ]
                   :
                      [
                      <Conversation key={cnv.id} id={cnv.id}
                       title={cnv.title} lastMessage={cnv.lastMessage}
                       ownerId={cnv.ownerId} prsId={this.props.Prss.id}
                       getLocation={this.getLocation}
                       setEdit={() => this.setState({
                          edit: true,
                          id: cnv.id
                       })}
                       setDelete = {() => this.setState({
                          delete: true,
                          id: cnv.id
                       })}
                       setCnv = {(cnv) => this.setState(cnv)}
                       convertTime={this.convertTime}
                       admin={this.props.Prss.role} />
                      ]
               )}
            </ListGroup>
            <Button bsStyle="primary" block
             onClick={() => this.setState({ new: true })}>
               <Glyphicon glyph="plus" />
            </Button>

            <ConfDialog show={this.state.new} title='New Conversation'
             body={
                <form>
                   <FieldGroup
                    id='newTitle' type='text' label='Title'
                    placeholder='New Title' value={this.state.title}
                    required={true} onChange={this.handleChange} />
                </form>
             }
             buttons={['Confirm', 'Cancel']}
             onClose={(action) => {
                if (action === 'Confirm') {
                  this.props.postCnvs({title: this.state.newTitle});
                }
                this.setState({ new: false });
             }} />

            <ConfDialog
             show={this.state.edit} title='Edit Conversation'
             body={
                <form>
                   <FieldGroup
                    id='newTitle' type='text' label='New Title'
                    placeholder='New Title' value={this.state.title}
                    required={true} onChange={this.handleChange} />
                </form>
             }
             buttons={['Confirm', 'Cancel']}
             onClose={(action) => {
                if (action === 'Confirm') {
                   this.props.editCnv(this.state.id,
                    { title: this.state.newTitle });
                }
                this.setState({ edit: false });
             }} />

            <ConfDialog
             show={this.state.delete} title='Delete Conversation?'
             buttons={['Confirm', 'Cancel']}
             onClose={(action) => {
                if (action === 'Confirm') {
                   this.props.deleteCnv(this.state.id);
                }
                this.setState({ delete: false });
             }} />
         </div>
      );
   }
}

export default Conversations;
