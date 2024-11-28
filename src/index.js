import React from 'react'
import ReactDOM from 'react-dom'
import 'antd/dist/antd.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './scss/style.scss'
import "lightgallery.js/dist/css/lightgallery.css";

import App from './App'
import reportWebVitals from './reportWebVitals'
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

const rootElement = document.getElementById('root')

if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ENV !== 'prod') {
  const aScript = document.createElement('script');
  aScript.type = 'text/javascript';
  aScript.src = process.env.PUBLIC_URL + "/newrelic-ui.js"

  document.head.appendChild(aScript);
  aScript.onload = function () {
    console.log("NewRelic Activated")
  };
}
if (process.env.REACT_APP_SENTRY) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY,
    integrations: [new Integrations.BrowserTracing()],

    attachStacktrace: true,
    tracesSampleRate: 1.0,
  });
  console.log("Sentry Activated")
}

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    rootElement
  )
}

if (module.hot) {
  module.hot.accept('./App', function () {
    setTimeout(render)
  })
}

render()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
