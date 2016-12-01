# react-ewd: React/Redux client module for [ewd-xpress](https://www.npmjs.com/package/ewd-xpress)

Interface module for writing [React](https://www.npmjs.com/package/react) applications with [ewd-xpress (EWD 3)](https://www.npmjs.com/package/ewd-xpress) back-end. Exposes the [ewd-client](https://www.npmjs.com/package/ewd-client) as object, in React context and as property for use in your React components. 

Thanks to [Rob Tweed](https://github.com/robtweed) for providing the [ewd-xpress-react](https://www.npmjs.com/package/ewd-xpress-react) module this interface module code is based on.

## Installing

    npm install react-ewd

## Use

With [React](https://www.npmjs.com/package/react) components and/or [Redux](https://www.npmjs.com/package/redux) and [Redux Thunk middleware](https://www.npmjs.com/package/redux-thunk), you can start from this example in your source code:

```javascript
import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { EWD, EWDProvider } from 'react-ewd';
...
let ewd = EWD({
  application: 'ewd-test-app', // application name
  log: true,
  url: 'http://localhost:8080',
  ajax: function(params, done, fail) {
   	...
  },
});

// we instantiate this object to pass the EWD 3 client to the Redux action methods in actions/*.js
let extraThunkArgument = { ewd };

/*
  instantiate the Redux store with thunk middleware, this allows to dispatch actions asynchronously
  devToolsExtension is needed to enable Redux DevTools for debugging in the browser
*/
const store = createStore(reducers, compose(applyMiddleware(thunk.withExtraArgument(extraThunkArgument)), window.devToolsExtension ? window.devToolsExtension() : f => f));

// main EWD 3 React container component (similar to the Top component in the ewd-xpress-react loader)
function ProviderContainer(props) {
  let styles = {
    MainDiv: { padding: 20 },
    Spinner: { width: '100%', height: 100 },
  };

  /*
    instantiate the Redux Provider with its store as property
    before the connection to the EWD 3 server is registered, a waiting Spinner is shown
    once the connection is registered, React renders our <App>
  */
  return (
    <Provider store={store}>
      <div style={styles.MainDiv}>
        {
          props.ewdProviderState.registered ?
            <App ewd={ewd} />
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
  instantiates the EWDProvider component where the ewd client instance is passed in as a property (for use in your components)
*/
render(
  <EWDProvider ewd={ewd}>
    <ProviderContainer />
  </EWDProvider>,
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
