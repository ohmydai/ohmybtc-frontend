import React from 'react'
import styles from './home.module.scss'
import { Route, Switch, Link } from 'react-router-dom'
import BuyerPage from '../Buyer'
import SellerPage from '../Seller'
import DashboardPage from '../Dashboard'
import RedeemPage from '../Redeem'
import UndoPage from '../Undo'
import WarningBanner from '../../components/WarningBanner'

// add more page sections above this component
const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Switch>
          <Route path='/buyer' component={BuyerPage} />
          <Route path='/seller' component={SellerPage} />
          <Route path='/dashboard' component={DashboardPage} />
          <Route path='/redeem' component={RedeemPage} />
          <Route path='/undo' component={UndoPage} />
          <Route exact path='/'>
            <div className={styles.title}>
              <div className={styles.titlerow}>
                Multi Collateral DAI is here,<br />
                do you think it will keep its peg?
              </div>
            </div>
            {/* <div className={styles.subtitle}>Choose your path:</div> */}
            <div className={styles.mainbutton}>
              <Link className={styles.buttonoption} to='/seller'>
                <div>I'd bet on its<br /> success</div>
              </Link>
              <Link className={styles.buttonoption} to='/buyer'>
                <div>I want <br />protection</div>
              </Link>
            </div>
            <WarningBanner />
          </Route>
        </Switch>
      </div>
    </div>
  )
}

export default Home
