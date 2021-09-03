import React from 'react';
import { Form, Row, Button, Table } from 'react-bootstrap';
import axios from 'axios'
import PageLayout from '../../layouts/PageLayout';
import AssetSearchQuery from '../../models/AssetSearchQuery';
import { OrderSide } from 'opensea-js/lib/types';


class BuyPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      assetUrl: '',
      assets: [],
      maxEth: 0,
      gas: '',
      customGas: 0,
      submitLock: false,
    };
  }

  componentDidMount() {
    this.refreshBuy();
  }

  handleChange = (event) => {
    const { name, value } = event.target
    this.setState({ ...this.state, [name]: value })
  }

  handleSubmit = async () => {
    const assetUrl = this.state.assetUrl;

    // Check if asset url    
    if (assetUrl.indexOf('https://opensea.io/assets/') === 0) {
      const urlSegments = assetUrl.split('/');
      const tokenAddress = urlSegments[4];
      const tokenId = urlSegments[5];

      if (!tokenAddress
        || !tokenId) {
        return;
      }

      this.setState({
        submitLock: true
      })

      let curIdx = this.state.assets.length;

      this.props.seaport.api.getAsset({
        tokenAddress: tokenAddress,
        tokenId: tokenId
      }).then(asset => {
        let curPrice = 'N/A';
        if (asset.orders.length > 0) {
          const order = asset.orders[0];
          const decimals = order.paymentTokenContract.decimals;
          if (order.paymentTokenContract.symbol !== 'ETH'
            && order.paymentTokenContract.symbol !== 'WETH') {
            alert('Order price is not ETH or WETH.');
            return;
          }
          curPrice = order.currentPrice / Math.pow(10, decimals);
        }

        this.setState({
          assetUrl: '',
          submitLock: false,
          assets: this.state.assets.concat({
            idx: curIdx,
            checked: false,
            name: asset.name,
            image: asset.imageUrl,
            link: asset.openseaLink,
            collection_slug: asset.collection.slug,
            collection_name: asset.collection.name,
            curPrice: curPrice,

            tokenAddress: tokenAddress,
            tokenId: tokenId,
            schemaName: asset.assetContract.schemaName,

            buyPrice: this.state.maxEth,
            gas: this.state.gas,
            customGas: this.state.customGas,

            status: ''
          })
        });

      }).catch(err => {

        console.log(err);

        this.setState({
          submitLock: false
        })

        alert('Get error while retrive asset.')
      })
    }

    // Check if collection url
    if (assetUrl.indexOf('https://opensea.io/collection/') === 0) {
      const urlSegments = assetUrl.split('/');
      const queryParams = urlSegments[4].split('?');

      const collectionName = queryParams[0];
      let searchParams = [];
      if (queryParams.length > 1) {
        searchParams = queryParams[1].split('&');
      }

      const assetSearchQuery = new AssetSearchQuery(collectionName, searchParams);
      const query = assetSearchQuery.buildQuery();

      let orgAssets = this.state.assets;

      this.setState({
        submitLock: true
      })

      axios.post('https://api.opensea.io/graphql/', query, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(resp => {

          let edges = resp.data['data']['query']['search']['edges'];
          edges.forEach(edge => {
            let asset = edge['node']['asset'];

            let curPrice = 'N/A';
            let bestAsk = asset.orderData.bestAsk;
            if (bestAsk) {
              const orderAsset = bestAsk.paymentAssetQuantity.asset;
              if (orderAsset.symbol !== 'ETH'
                && orderAsset.symbol !== 'WETH') {
                console.log(asset.name + ': price is not ETH or WETH.');
                return;
              }
              curPrice = bestAsk.paymentAssetQuantity.quantity / Math.pow(10, orderAsset.decimals);
            }

            let curIdx = orgAssets.length;
            orgAssets.push({
              idx: curIdx,
              checked: false,
              name: asset.name,
              image: asset.imageUrl,
              link: asset.openseaLink,
              collection_slug: asset.collection.slug,
              collection_name: asset.collection.name,
              curPrice: curPrice,

              tokenAddress: asset.assetContract.address,
              tokenId: asset.tokenId,

              buyPrice: this.state.maxEth,
              gas: this.state.gas,
              customGas: this.state.customGas,

              status: ''
            });
          })

          this.setState({
            submitLock: false,
            assets: orgAssets
          })
        })
        .catch(err => {
          console.log(err);

          this.setState({
            submitLock: false
          })

          alert('Get error while parse url.');
        });
    }
  }

  handleReset = () => {
    this.setState({
      assetUrl: '',
      assets: []
    });
  }

  handleDelete = (idx) => {
    let assets = this.state.assets;
    assets.splice(idx, 1);

    this.setState({
      assets: assets
    });
  }

  refreshBuy = async () => {

    let assets = this.state.assets;
    let accountAddress = this.props.accountAddress;
    console.log('timeout');

    for (let idx = 0; idx < assets.length; idx++) {

      try {
        const order = await this.props.seaport.api.getOrder({
          side: OrderSide.Sell,
          token_id: assets[idx].tokenId,
          asset_contract_address: assets[idx].tokenAddress
        });

        const decimals = order.paymentTokenContract.decimals;
        const curPrice = order.currentPrice / Math.pow(10, decimals);

        assets[idx].curPrice = curPrice;
        this.setState({
          assets: assets
        });

        if (curPrice <= assets[idx].buyPrice) {
          this.props.seaport.fulfillOrder({
            order,
            accountAddress
          }).then(resp => {
            assets[idx].status = "Order has been successed.";
            this.setState({
              assets: assets
            });
          }).catch(err => {
            assets[idx].status = err.message;
            this.setState({
              assets: assets
            });
          })
        }
      }
      catch (err2) {
        assets[idx].status = err2.message;
        this.setState({
          assets: assets
        });
      }
    }

    setTimeout(() => {
      this.refreshBuy();
    }, 1000 * 10);

  }

  render() {
    return (
      <PageLayout>

        <h4>
          Buy Automation
        </h4>

        <Form className="my-4">

          <div className="d-flex mb-3 align-items-end">

            <Row style={{ flex: 1 }}>
              <Form.Group controlId="assetUrl">
                <Form.Label>Asset Url</Form.Label>
                <Form.Control type="text" placeholder="Enter asset url" name="assetUrl" value={this.state.assetUrl} onChange={this.handleChange} />
              </Form.Group>

              <div className="d-flex mt-3">
                <Form.Group controlId="maxEth" style={{ flex: 1 }}>
                  <Form.Label>Max ETH</Form.Label>
                  <Form.Control type="number" placeholder="Enter asset url" name="maxEth" value={this.state.maxEth} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group controlId="gas" style={{ flex: 1, marginLeft: 16 }}>
                  <Form.Label>Gas</Form.Label>
                  <Form.Select name="gas" value={this.state.gas} onChange={this.handleChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="maxEth" style={{ flex: 1, marginLeft: 16 }}>
                  <Form.Label>Custom Gas</Form.Label>
                  <Form.Control type="number" placeholder="Enter custom gas" name="customGas" value={this.state.customGas} onChange={this.handleChange} />
                </Form.Group>
              </div>
            </Row>

            <Button variant="primary" style={{ marginLeft: 32 }} active onClick={this.handleSubmit} disabled={this.state.submitLock}>Submit</Button>
            <Button variant="danger" style={{ marginLeft: 16 }} onClick={this.handleReset} disabled={this.state.submitLock}>Reset</Button>

          </div>

        </Form>

        <Table striped hover size="sm" style={{ marginTop: 24, textAlign: 'center' }}>
          <thead>
            <tr>
              <th width="20"></th>
              <th width="20"></th>
              <th width="50">NFT Collection</th>
              <th width="100">NFT Token</th>
              <th width="50">Cur Price</th>
              <th width="50">Buy Price</th>
              <th width="50">Gas</th>
              <th width="200"></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.assets
                .map((asset, index) =>
                  <tr key={index}>
                    <td className="align-middle">
                      <button type="button" className="btn btn-outline" onClick={() => this.handleDelete(index)}>X</button>
                    </td>
                    <td className="align-middle">
                      <img src={asset.image} alt={asset.name} style={{ height: 80 }} />
                    </td>
                    <td className="align-middle">
                      <a target="_blank" rel="noreferrer" href={"https://opensea.io/collection/" + asset.collection_slug}>{asset.collection_name}</a>
                    </td>
                    <td className="align-middle">
                      <a target="_blank" rel="noreferrer" href={asset.link}>{asset.name}</a>
                    </td>
                    <td className="align-middle">
                      {asset.curPrice}
                    </td>
                    <td className="align-middle">
                      {asset.buyPrice}
                    </td>
                    <td className="align-middle">
                      {asset.gas === 'custom' ? asset.customGas : asset.gas}
                    </td>
                    <td className="align-middle">
                      {asset.status}
                    </td>
                  </tr>
                )
            }
          </tbody>
        </Table>

      </PageLayout >
    );
  }
};

export default BuyPage;
