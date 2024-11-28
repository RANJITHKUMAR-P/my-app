/* eslint-disable no-unused-vars */
import axios from 'axios'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux'

import store, { persistor } from './Store'
import AppRouter from './Router/AppRouter'
import AuthRouteProvider, { AuthContext } from './Router/AuthRouteProvider'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

axios.defaults.baseURL = process.env.REACT_APP_API_URL
axios.defaults.headers.get['Accept'] = 'application/json'
axios.defaults.headers.post['Accept'] = 'application/json'

window.switchHotel = false

if (window.location.pathname === '.well-known/assetlinks.json') {
  window.location.href = '/.well-known/assetlinks.json'
}

const aasa = `{"applinks":{"apps":[],"details":[{"appID":"459JCPMD77.com.staff.inplass","paths":["*"]}]}}`

function AppleAppSiteAssociation() {
  return <pre>{aasa}</pre>
}

function GlobalRouter() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path={[
            '/apple-app-site-association',
            '/.well-known/apple-app-site-association',
            '/.well-known/apple-app-site-association.json',
          ]}
          component={AppleAppSiteAssociation}
        />
        <Route component={App} />
      </Switch>
    </BrowserRouter>
  )
}

function App() {
  return (
    <div className='App'>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthRouteProvider>
            <AuthContext.Consumer>
              {context => (
                <AppRouter key={context?.isAppLoaded} context={context} />
              )}
            </AuthContext.Consumer>
          </AuthRouteProvider>
        </PersistGate>
      </Provider>
    </div>
  )
}

export default GlobalRouter
