/*

 ----------------------------------------------------------------------------
 | react-ewd: React/Redux client module for ewd-xpress                      |
 |                                                                          |
 | Copyright (c) 2017 Stabe nv,                                             |
 | Hofstade, Oost-Vlaanderen,                                               |
 | All rights reserved.                                                     |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  19 April 2017

*/

import { Component, cloneElement } from 'react';
import PropTypes from 'prop-types';
import ewdClient from 'ewd-client';

// create a QEWDProvider component for use in the main React component render()
export class QEWDProvider extends Component {
  // add the qewd client also to the React context for use in child components
  // as QEWDProvider is the parent of all components in the application, you can use
  // qewd also from this.context.qewd
  getChildContext() {
    return { qewd: this.qewd }
  }

  // store the ewd client instance also as object property
  // initialize the ewd client state to not registered
  constructor(props, context) {
    super(props, context)
    this.qewd = props.qewd
    this.state = { registered: false }
  }

  // when QEWDProvider is instantiated by React, we can add a 'ewd-registered' event handler which sets the EWDProvider state to registered
  // and starts the ewd-client using the rcStart() method
  componentDidMount() {
    let component = this;
    this.qewd.on('ewd-registered', function() {
      component.setState({ registered: true });
    });
    this.qewd.on('ewd-reregistered', function() {
      component.setState({ registered: true });
    });
    this.qewd.on('socketDisconnected', function() {
      component.setState({ registered: false });
    });
    if (this.qewd.log) console.log('starting QEWD ...');
    this.qewd.rstart();
  }

  // pass the ewd client object as property to all child components
  // pass the provider state (registered) to children to render the main <App> component when registration is done
  render() {
    return cloneElement(this.props.children, { qewd: this.props.qewd, qewdProviderState: this.state })
  }
}

// declare the context type for the ewd client object
QEWDProvider.childContextTypes = {
  qewd: PropTypes.object
};

// instantiation function to use ewd-client with Redux store & thunk middleware, allows async actions
export function QEWD(params) {
  let io;
  if (!params.no_sockets) io = require('socket.io-client');
  let $;
  if (params.use_jquery && !params.ajax) $ = require('jquery');

  // set up start parameters for ewd-client
  let QEWD = ewdClient.EWD;
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
  QEWD.rcStart = function() {
    QEWD.start(application);
  };
  QEWD.rstart = QEWD.rcStart;

  // return the ewd client instance for use in the Redux createStore() method
  return QEWD;
}
