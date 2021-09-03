import React from "react";

import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";

import { OpenSeaPort, Network } from 'opensea-js';

import BuyPage from "./views/buy/BuyPage";
import OfferPage from "./views/offer/OfferPage";
import CollectionPage from "./views/collection/CollectionPage";
import ErrorPage from "./views/errors/ErrorPage";

class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      accountAddress: null
    }

    this.onChangeAddress()
  }

  onChangeAddress = async () => {
    window.ethereum.enable()
      .then(() => {

        this.seaport = new OpenSeaPort(window.ethereum, {
          networkName: Network.Main
        })
        this.web3 = this.seaport.web3
        this.web3.eth.getAccounts((err, res) => {
          this.setState({
            accountAddress: res[0]
          })
        })
      })
      .catch(err => {
        alert('Connect wallet failed.');
      })
  }

  render() {
    return (
      <Router>
        <Switch>

          <Route path="/buy">
            <BuyPage
              seaport={this.seaport}
              accountAddress={this.state.accountAddress}
            />
          </Route>

          <Route path="/offer">
            <OfferPage
              seaport={this.seaport}
              accountAddress={this.state.accountAddress}
            />
          </Route>

          <Route path="/collection">
            <CollectionPage />
          </Route>

          <Route exact path="/">
            <Redirect to="/buy" />
          </Route>

          <Route path="*">
            <ErrorPage />
          </Route>

        </Switch>
      </Router>
    )
  }
}

export default App;
