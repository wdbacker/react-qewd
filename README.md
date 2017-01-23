# react-ewd: React/Redux client module for [QEWD](https://www.npmjs.com/package/qewd)

Interface module for writing [React](https://www.npmjs.com/package/react) applications with [qewd (QEWD)](https://www.npmjs.com/package/qewd) back-end. Exposes the [ewd-client](https://www.npmjs.com/package/ewd-client) as object, in React context and as property for use in your React components. 

Thanks to [Rob Tweed](https://github.com/robtweed) for providing the [qewd-react](https://www.npmjs.com/package/qewd-react) module this interface module code is based on.

## Installing

    npm install react-qewd

## Use

With [React](https://www.npmjs.com/package/react) components and/or [Redux](https://www.npmjs.com/package/redux) and [Redux Thunk middleware](https://www.npmjs.com/package/redux-thunk), you can start from this example in your source code:

```javascript
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { QEWD, QEWDProvider } from 'react-qewd';
...
let qewd = QEWD({
  application: 'qewd-test-app', // application name
  log: true,
  url: 'http://localhost:8080',
  ajax: function(params, done, fail) {
   	...
  },
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

## License

 Copyright (c) 2016 Stabe nv,  
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
