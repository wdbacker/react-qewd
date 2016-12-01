import { Component, PropTypes, cloneElement } from 'react';
import ewdClient from 'ewd-client';

// create an EWDProvider component for use in the main React component render()
export class EWDProvider extends Component {
  // add the ewd client also to the React context for use in child components
  // as EWDProvider is the parent of all components in the application, you can use
  // ewd also from this.context.ewd
  getChildContext() {
    return { ewd: this.ewd }
  }

  // store the ewd client instance also as object property
  // initialize the ewd client state to not registered
  constructor(props, context) {
    super(props, context)
    this.ewd = props.ewd
    this.state = { registered: false }
  }

  // when EWDProvider is instantiated by React, we can add a 'ewd-registered' event handler which sets the EWDProvider state to registered
  // and starts the ewd-client using the rcStart() method
  componentDidMount() {
    let component = this;
    this.ewd.on('ewd-registered', function() {
      component.setState({ registered: true });
    });
    if (this.ewd.log) console.log('starting EWD 3 ...');
    this.ewd.rcStart();
  }

  // pass the ewd client object as property to all child components
  // pass the provider state (registered) to children to render the main <App> component when registration is done
  render() {
    return cloneElement(this.props.children, { ewd: this.props.ewd, ewdProviderState: this.state })
  }
}

// declare the context type for the ewd client object
EWDProvider.childContextTypes = {
  ewd: PropTypes.object
};

// instantiation function to use ewd-client with Redux store & thunk middleware, allows async actions
export function EWD(params) {
  let io;
  if (!params.no_sockets) io = require('socket.io-client');
  let $;
  if (!params.ajax) $ = require('jquery');

  // set up start parameters for ewd-client
  let EWD = ewdClient.EWD;
  let application = {
    application: params.application || 'unknown',
    io: io,
    $: $,
    ajax: params.ajax || null,
    url: params.url || null,
    mode: params.mode || 'development',
    log: params.log || true,
  };

  // custom start method for use with React Components
  EWD.rcStart = function() {
    EWD.start(application);
  };

  // return the ewd client instance for use in the Redux createStore() method
  return EWD;
}
