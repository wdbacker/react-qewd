# react-qewd: React/Redux client module for [QEWD](https://www.npmjs.com/package/qewd)

Interface module for writing [React](https://www.npmjs.com/package/react) applications with [qewd (QEWD)](https://www.npmjs.com/package/qewd) back-end. Exposes the [ewd-client](https://www.npmjs.com/package/ewd-client) as object, in React context and as property for use in your React components.

A similar Vue.js module [vue-qewd](https://www.npmjs.com/package/vue-qewd) also exists.

[QEWD](http://qewdjs.com/) is a unique web framework allowing you to concentrate on your application code, without worrying about system infrastructure, featuring:
- a WebSockets server, allowing your application to connect via this `vue-qewd` module using [ewd-client](https://www.npmjs.com/package/ewd-client)
- a (federating) REST server, to build your REST endpoints & allowing you to federate requests to other (chained) QEWD servers, featuring [Express](https://expressjs.com/) or [Koa](http://koajs.com/) as underlying frameworks
- a microservices server, using very efficient (permanent, secured) WebSocket connections to other QEWD servers using [JWT](https://jwt.io/)'s
- a [GraphQL](http://graphql.org/) server to write & process your GraphQL queries & mutations
- an application router to orchestrate all your different application endpoint(s)/handler(s)
- a master/worker multi-process queue architecture, high-performance and very scalable
- session management/cache allowing you to write stateful applications
- response customization: combine responses from different servers, return responses in different formats, intercept an re-route requests, ...
- database independence: use the [InterSystems Caché unified multi-model database](https://www.intersystems.com/products/cache/), [Redis](https://redis.io/), [GT/M](https://sourceforge.net/projects/fis-gtm/), ... or whatever (No)SQL database technology you like!

Thanks to [Rob Tweed](https://github.com/robtweed) for providing the [qewd-react](https://www.npmjs.com/package/qewd-react) module this interface module code is based on.

## Installing

    npm install react-qewd

## Use

With [React](https://www.npmjs.com/package/react) components and/or [Redux](https://www.npmjs.com/package/redux) and [Redux Thunk middleware](https://www.npmjs.com/package/redux-thunk), you can start from this example in your source code (just create a standard create-react-app template first).

Install some dependencies:

    npm install redux react-redux redux-thunk bootstrap react-bootstrap react-spinner react-toastr

First, modify index.js:

```javascript
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { QEWD, QEWDProvider } from 'react-qewd';
import App from 'components/App';
import Spinner from 'react-spinner';
import reducers from './reducers';
import 'styles/app.scss';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

let qewd = QEWD({
  application: 'qewd-test-app', // application name
  log: true,
  url: 'http://localhost:8080'
});

// we instantiate this object to pass the EWD 3 client to the Redux action methods in actions/*.js
let extraThunkArgument = { qewd };

/*
  instantiate the Redux store with thunk middleware, this allows to dispatch actions asynchronously
  devToolsExtension is needed to enable Redux DevTools for debugging in the browser
*/
const store = createStore(reducers, compose(applyMiddleware(thunk.withExtraArgument(extraThunkArgument)), window.devToolsExtension ? window.devToolsExtension() : f => f));

// main QEWD React container component (similar to the Top component in the qewd-react loader)
function ProviderContainer(props) {
  let styles = {
    MainDiv: { padding: 20 },
    Spinner: { width: '100%', height: 100 },
  };

  /*
    instantiate the Redux Provider with its store as property
    before the connection to the QEWD server is registered, a waiting Spinner is shown
    once the connection is registered, React renders our <App>
  */
  return (
    <Provider store={store}>
      <div style={styles.MainDiv}>
        {
          props.qewdProviderState.registered ?
            <App qewd={qewd} />
          :
            <div style={styles.Spinner}>
              <Spinner />
            </div>
        }
      </div>
    </Provider>
  )
}

/*
  main starting point of your React/Redux application
  instantiates the QEWDProvider component where the qewd client instance is passed in as a property (for use in your components)
*/
render(
  <QEWDProvider qewd={qewd}>
    <ProviderContainer />
  </QEWDProvider>,
  document.getElementById('content')
);

```

Next, modify the App component in components/App.js:

```javascript
import React, { PropTypes, createFactory } from 'react';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import { connect } from 'react-redux';
import { ToastContainer, ToastMessage } from 'react-toastr';
import { requestQEWDMessage }  from '../actions/tests';
import 'styles/app.scss';
import 'bootstrap/dist/css/bootstrap.css';

// our main App component, contains the main App functionality
class App extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    // bind handleSubmit to App component scope
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // load and augment the ewd client for this module...
    let { qewd } = this.props;
    const component = this;
    // add toast container to ewd client to display warnings
    qewd.toastr = function(type, text) {
      if (type && type !== '' && component._toastContainer && component._toastContainer[type]) {
        component._toastContainer[type](text);
      }
    };
    // shortcut method for displaying errors
    qewd.displayError = function(error) {
      qewd.toastr('error', error);
    };
  }

  componentDidMount() {
    const { qewd } = this.props;
    console.log('App started!');
    qewd.toastr('success', 'Test App started!');
  }

  handleSubmit(e) {
    const { dispatch } = this.props;

    // prevent default form submitting by browser
    e.preventDefault();
    // pick up message text value entered by user
    const message = this._messageInput.value.trim();
    if (message) {
      // dispatch a requestQEWDMessage action to actions/tests.js
      dispatch(requestQEWDMessage(message));
      this._messageInput.value = '';
    }
  }

  render() {
    const ToastMessageFactory = createFactory(ToastMessage.animation);
    const { messageText } = this.props;

    // instantiate ToastContainer component for displaying warnings to the user
    // add a small form containing the message text input, add a reference to the textinput to the <App> component for handleSubmit()
    // display the messageText we received from teh EWD 3 server and show it, this property is updated by changing the state in reducers/index.js
    // because state.messageText is mapped to the messageText prop (see last line), the UI will be updated by React
    return (
      <span>
        <ToastContainer
          ref={(c) => { this._toastContainer = c; }} // strings refs are deprecated
          toastMessageFactory={ToastMessageFactory}
          className="toast-top-right"
          newestOnTop={true}
          target="body"
        />
        <div>
          <form onSubmit={e => this.handleSubmit(e)}>
            <FormGroup>
              <ControlLabel>Message to QEWD back-end:</ControlLabel>
              <input className="form-control" type="text" placeholder="Enter message" ref={(c) => {this._messageInput = c}} />
            </FormGroup>
          </form>
          <div>
            <b>Message from QEWD back-end: {messageText}</b>
          </div>
        </div>
      </span>
    );
  }
}

// create a mapStateToProps function to create a property object (identical to the state content here)
const mapStateToProps = state => ({ ...state });

// connect with Redux the internal/immutable Redux state to the props of the <App> component
export default connect(mapStateToProps)(App);
```

Next, create Redux action types in constants/ActionTypes.js:

```javascript
// define your action types as string constants for easy maintenance
export const REQUEST_QEWD_MESSAGE = 'REQUEST_QEWD_MESSAGE';
export const RECEIVE_QEWD_MESSAGE = 'RECEIVE_QEWD_MESSAGE';
```

Next, create Redux actions in actions/tests.js:

```javascript
import * as types from 'constants/ActionTypes';

// message request action: post message text to EWD 3 back-end using ewd.send()
// sending is asynchronous, when ewd.send() completes, a second receiveQEWDMessage action is dispatched
// notice the qewd client is passed in by the Redux thunk middleware by destructuring the extraArgument { qewd }
export const requestQEWDMessage = (text) => {
  return (dispatch, getState, { qewd }) => {
    let messageObj = {
      type: 'test',
      //ajax: true,
      params: {
        text: text
      }
    };
    qewd.send(messageObj, function(messageObj) {
      //console.log('send messageObj: ', messageObj);
      dispatch(receiveQEWDMessage(messageObj.message));
      qewd.toastr('warning', 'QEWD message received: ' + messageObj.message.text);
    });
  }
};

// return the message text received from EWD 3 synchronously as an action object
// to the Redux reducer (in reducers/index.js), is passed in there as action object
const receiveQEWDMessage = function(message) {
  //console.log('message: ', message);
  var text = (message ? message.text || '' : '') || '';
  return {
    type: types.RECEIVE_QEWD_MESSAGE,
    text
  }
};
```

Next, create reducers in reducers/index.js:

```javascript
import * as types from 'constants/ActionTypes';
import { combineReducers } from 'redux';

// define a messageText reducer method called by Redux
// modifies the state object in Redux
// you need to return a new state always and the action data needs to be copied to the state
// for complex data structures like objects, arrays, ..., use deepAssign method from immutableJS
function messageText(state = '', action) {
  switch (action.type) {
    case types.RECEIVE_QEWD_MESSAGE:
      console.log('reduce RECEIVE_QEWD_MESSAGE action: ', action);
      return action.text;

    default:
      return state;
  }
}

// all (sub)reducers must be combined to one single reducer
// Redux creates only one store for the whole application
export default combineReducers({
  messageText,
});
```

Next, create styling in styles/app.scss:

```javascript
@import 'base';
@import 'react-spinner';
@import url('http://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css');
@import url('http://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.1/animate.css');
```

Next, create styling in styles/_base.scss:

```javascript
body {
  background-color: rgb(252, 252, 252) !important;
}
```

Next, create styling in styles/_react-spinner.scss:

```javascript
.react-spinner {
  position: relative;
  width: 32px;
  height: 32px;
  top: 50%;
  left: 50%;
}

.react-spinner_bar {
  -webkit-animation: react-spinner_spin 1.2s linear infinite;
  -moz-animation: react-spinner_spin 1.2s linear infinite;
  animation: react-spinner_spin 1.2s linear infinite;
  border-radius: 5px;
  background-color: black;
  position: absolute;
  width: 20%;
  height: 7.8%;
  top: -3.9%;
  left: -10%;
}

@keyframes react-spinner_spin {
 0% { opacity: 1; }
 100% { opacity: 0.15; }
}

@-moz-keyframes react-spinner_spin {
 0% { opacity: 1; }
 100% { opacity: 0.15; }
}

@-webkit-keyframes react-spinner_spin {
 0% { opacity: 1; }
 100% { opacity: 0.15; }
}
```

Next, add styling in App.css:

```javascript
.App {
  text-align: center;
}

.App-logo {
  animation: App-logo-spin infinite 20s linear;
  height: 80px;
}

.App-header {
  background-color: #222;
  height: 150px;
  padding: 20px;
  color: white;
}

.App-intro {
  font-size: large;
}

@keyframes App-logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

Next, add styling in index.css:

```javascript
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
```

Finally, start the test application:

    npm start


## License

 Copyright (c) 2017 Stabe nv,  
 Hofstade, Oost-Vlaanderen, BE  
 All rights reserved

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
