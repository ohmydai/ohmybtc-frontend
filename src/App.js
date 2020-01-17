import React from 'react'
import ReactGA from 'react-ga'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { GlobalStyles } from './theme'
import { useWeb3Provider, Web3Context } from './hooks/web3'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import HomePage from './pages/Home'
import PageNotFound from './pages/PageNotFound'

import Header from './components/Header'
import Footer from './components/Footer'

if (process.env.NODE_ENV === 'production') {
  ReactGA.initialize('UA-152700397-1')
} else {
  ReactGA.initialize('test', { testMode: true })
}
ReactGA.pageview(window.location.pathname + window.location.search)

const App = () => {
  toast.configure()
  const { web3 } = useWeb3Provider()
  return (
    <Web3Context.Provider value={web3}>
      <GlobalStyles />
      <Router>
        <Header />
        <Switch>
          <Route path='/' component={HomePage} />
          <Route component={PageNotFound} />
        </Switch>
        <Footer />
      </Router>
    </Web3Context.Provider>
  )
}

export default App
