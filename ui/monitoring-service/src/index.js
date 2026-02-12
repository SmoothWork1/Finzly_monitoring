import React from "react"
import ReactDOM from 'react-dom/client';
import App from "./App"
// import IndexApp from "./IndexApp"
import * as serviceWorker from "./serviceWorker"
import { BrowserRouter } from "react-router-dom"
import "./i18n"

import { Provider } from "react-redux"

import store from "./store"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
      <React.Fragment>
        <BrowserRouter>
          <App />
          {/* <IndexApp /> */}
        </BrowserRouter>
      </React.Fragment>
    </Provider>
);
serviceWorker.unregister()