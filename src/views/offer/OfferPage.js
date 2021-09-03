import React from 'react';
import { Form, Row, Button, Table, InputGroup } from 'react-bootstrap';
import axios from 'axios'
import PageLayout from '../../layouts/PageLayout';
import AssetSearchQuery from '../../models/AssetSearchQuery';


class OfferPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      assetUrl: '',
      assets: [],
      offerPrice: 0,
      expirationHours: 1,
      allChecked: false,
      submitLock: false,
    };
  }

  componentDidMount() {
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

        let lastPrice = 'N/A';
        if(asset.lastSale) {
          const saleAsset = asset.lastSale.paymentToken;
          lastPrice = asset.lastSale.totalPrice / Math.pow(10, saleAsset.decimals) + " " + saleAsset.symbol;
        }        

        this.setState({
          assetUrl: '',
          submitLock: false,
          assets: this.state.assets.concat({
            idx: curIdx,
            checked: false,
            name: asset.name ? asset.name : tokenId,
            image: asset.imageUrl,
            link: "https://opensea.io/assets/" + tokenAddress + "/" + tokenId,
            collection_slug: asset.collection.slug,
            collection_name: asset.collection.name,
            curPrice: curPrice,
            lastPrice: lastPrice,

            tokenAddress: tokenAddress,
            tokenId: tokenId,
            schemaName: asset.assetContract.schemaName,

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
                console.log(asset.tokenId + ': price is not ETH or WETH.');
                return;
              }
              curPrice = bestAsk.paymentAssetQuantity.quantity / Math.pow(10, orderAsset.decimals);
            }

            let lastPrice = 'N/A';
            let lastSale = asset.assetEventData.lastSale;
            if (lastSale) {
              const saleAsset = lastSale.unitPriceQuantity.asset;
              lastPrice = lastSale.unitPriceQuantity.quantity / Math.pow(10, saleAsset.decimals) + " " + saleAsset.symbol;
            }

            let tokenAddress = asset.assetContract.address;
            let tokenId = asset.tokenId;

            let curIdx = orgAssets.length;
            orgAssets.push({
              idx: curIdx,
              checked: false,
              name: asset.name ? asset.name : tokenId,
              image: asset.imageUrl,
              link: "https://opensea.io/assets/" + tokenAddress + "/" + tokenId,
              collection_slug: asset.collection.slug,
              collection_name: asset.collection.name,
              curPrice: curPrice,
              lastPrice: lastPrice,

              tokenAddress: tokenAddress,
              tokenId: tokenId,

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

  handleAllChecked = (event) => {
    const { checked } = event.target

    let assets = this.state.assets;
    assets.forEach(asset => {
      asset.checked = checked;
    })

    this.setState({
      allChecked: checked,
      assets: assets
    })
  }

  handleChecked = (event, idx) => {
    const { checked } = event.target
    console.log(idx, checked);

    let assets = this.state.assets;
    assets[idx].checked = checked;

    this.setState({
      assets: assets
    });
  }

  handleOffer = async () => {

    let expirationHours = this.state.expirationHours;

    // Get checked assets
    let _assets = this.state.assets;
    let assets = _assets.filter(asset => {
      return asset.checked
    });

    if (assets.length === 0) {
      alert('Please check assets.');
      return;
    }

    this.setState({
      submitLock: true
    });

    let accountAddress = this.props.accountAddress;
    let offerPrice = this.state.offerPrice;

    for (let i = 0; i < assets.length; i++) {
      let asset = assets[i];

      try {
        const result = await this.props.seaport.createBuyOrder({
          asset: {
            tokenId: asset.tokenId,
            tokenAddress: asset.tokenAddress,
            // schemaName: asset.schemaName,
          },
          accountAddress,
          startAmount: offerPrice,
          expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * expirationHours)
        });
        console.log(result);

        _assets[asset.idx].status = 'Offer successed.';
        _assets[asset.idx].checked = false;
        this.setState({
          assets: _assets
        });
      }
      catch (err) {
        console.log(err);

        _assets[asset.idx].status = err.message;
        _assets[asset.idx].checked = false;
        this.setState({
          assets: _assets
        });
      }
    }

    this.setState({
      submitLock: false
    });

  }

  render() {
    return (
      <PageLayout>

        <h4>
          Offer Automation
        </h4>

        <Form className="my-4">

          <div className="d-flex mb-3 align-items-end">

            <Row style={{ flex: 1 }}>
              <Form.Group controlId="assetUrl">
                <Form.Label>Asset Url</Form.Label>
                <Form.Control type="text" placeholder="Enter asset url" name="assetUrl" value={this.state.assetUrl} onChange={this.handleChange} />
              </Form.Group>
            </Row>

            <Button variant="primary" style={{ marginLeft: 32 }} active onClick={this.handleSubmit} disabled={this.state.submitLock}>Submit</Button>
            <Button variant="danger" style={{ marginLeft: 16 }} onClick={this.handleReset} disabled={this.state.submitLock}>Reset</Button>

          </div>

        </Form>

        <Table striped hover size="sm" style={{ marginTop: 24, textAlign: 'center' }}>
          <thead>
            <tr>
              <th width="20">
                <InputGroup className="text-center justify-content-center">
                  <InputGroup.Checkbox name="allChecked" checked={this.state.allChecked} onChange={this.handleAllChecked} />
                </InputGroup>
              </th>
              <th width="20"></th>
              <th width="50">NFT Collection</th>
              <th width="100">NFT Token</th>
              <th width="50">Current Value (ETH)</th>
              <th width="50">Last purchase price</th>
              <th width="200"></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.assets
                .map((asset, index) =>
                  <tr key={index}>
                    <td className="align-middle">
                      <InputGroup className="text-center justify-content-center">
                        <InputGroup.Checkbox name="checked" checked={asset.checked} onChange={evt => this.handleChecked(evt, index)} />
                      </InputGroup>
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
                      {asset.lastPrice}
                    </td>
                    <td className="align-middle">
                      {asset.status}
                    </td>
                  </tr>
                )
            }
          </tbody>
        </Table>

        <Form className="my-4">

          <div className="d-flex mb-3 align-items-end">

            <Form.Group controlId="offerPrice" style={{ marginRight: 24 }}>
              <Form.Label>Offer Price</Form.Label>
              <Form.Control type="number" placeholder="Enter offer price" name="offerPrice" value={this.state.offerPrice} onChange={this.handleChange} />
            </Form.Group>

            <Form.Group controlId="expirationHours" style={{ marginRight: 24 }}>
              <Form.Label>Expiration hours from now</Form.Label>
              <Form.Control type="number" placeholder="Enter hours number" name="expirationHours" value={this.state.expirationHours} onChange={this.handleChange} />
            </Form.Group>

            <Button variant="primary" active onClick={this.handleOffer} disabled={this.state.submitLock}>Offer</Button>

          </div>

        </Form>

      </PageLayout >
    );
  }
};

export default OfferPage;
