import React from 'react';
import { Col, Form, Row, Button, Table } from 'react-bootstrap';
import PageLayout from '../../layouts/PageLayout';
import axios from 'axios'


class CollectionPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      walletAddress: '',
      collectionName: '',
      collections: [],
      submitLock: false,
    };

  }

  componentDidMount = () => {
    setInterval(() => {
      this.refreshCollections();
    }, 1000 * 10);
  }

  handleChange = (event) => {
    const { name, value } = event.target
    this.setState({ ...this.state, [name]: value })
  }

  handleSubmit = () => {
    const walletAddress = this.state.walletAddress;
    const collectionName = this.state.collectionName;

    if (walletAddress === ''
      || collectionName === '') {
      return;
    }

    this.setState({
      submitLock: true
    })

    this.getCollection(walletAddress, collectionName)
      .then(collection => {
        this.setState({
          submitLock: false,
          walletAddress: '',
          collectionName: '',
          collections: this.state.collections.concat(collection)
        })
      })
      .catch(err => {
        this.setState({
          submitLock: false
        })
        alert('Get error while add collection.');
      })
  }

  handleDelete = (idx) => {
    let collections = this.state.collections;
    collections.splice(idx, 1);

    this.setState({
      collections: collections
    });
  }

  getCollection = (owner, name) => {

    return new Promise((resolve, reject) => {

      axios.get('https://api.opensea.io/api/v1/collections?offset=0&limit=200&asset_owner=' + owner)
        .then(resp => {
          let _collections = resp.data.filter(collection => {
            return collection.name.toLowerCase() === name.toLowerCase();
          })

          if (_collections.length === 0) {
            reject('Collection not exists.');
          }

          let _collection = _collections[0];
          let data = {
            'name': _collection['name'],
            'slug': _collection['slug'],
            'image_url': _collection['image_url'],
            'total_supply': _collection['stats']['total_supply'],
            'floor_price': _collection['stats']['floor_price'],
            'owner': owner,
          };
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    })

  }

  refreshCollections = () => {

    let collections = this.state.collections;
    console.log('timeout');

    collections.forEach((collection, idx) => {

      let walletAddress = collection.owner;
      let collectionName = collection.name;

      this.getCollection(walletAddress, collectionName)
        .then(collection => {
          collections[idx] = collection;

          this.setState({
            collections: collections
          });
        })
        .catch(err => {
          console.log(err);
        })
    })

  }

  render() {
    return (
      <PageLayout>

        <h4>
          Collection Monitor
        </h4>

        <Form className="my-4">

          <div className="d-flex mb-3 align-items-end">

            <Row style={{ flex: 1 }}>
              <Form.Group as={Col} controlId="walletAddress">
                <Form.Label>Wallet address</Form.Label>
                <Form.Control type="text" placeholder="Enter wallet address" name="walletAddress" value={this.state.walletAddress} onChange={this.handleChange} />
              </Form.Group>

              <Form.Group as={Col} controlId="collectionName">
                <Form.Label>Collection name</Form.Label>
                <Form.Control type="text" placeholder="Enter collection name" name="collectionName" value={this.state.collectionName} onChange={this.handleChange} />
              </Form.Group>
            </Row>

            <Button variant="primary" style={{ marginLeft: 32 }} active onClick={this.handleSubmit} disabled={this.state.submitLock}>Submit</Button>

          </div>

        </Form>

        <Table striped hover size="sm" style={{ marginTop: 24, textAlign: 'center' }}>
          <thead>
            <tr>
              <th width="50"></th>
              <th width="50"></th>
              <th width="100">NFT Collection</th>
              <th width="100"># of NFTs</th>
              <th width="100">Price Floor</th>
              <th width="100"></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.collections
                .map((item, index) =>
                  <tr key={index}>
                    <td className="align-middle">
                      <button onClick={() => this.handleDelete(index)} className="btn btn-default">X</button>
                    </td>
                    <td className="align-middle">
                      <img src={item.image_url} alt={item.name} />
                    </td>
                    <td className="align-middle">
                      <a target="_blank" rel="noreferrer" href={"https://opensea.io/collection/" + item.slug}>{item.name}</a>
                    </td>
                    <td className="align-middle">
                      {item.total_supply}
                    </td>
                    <td className="align-middle">
                      {item.floor_price}
                    </td>
                    <td className="align-middle">
                      <a target="_blank" rel="noreferrer" href={"https://opensea.io/collection/" + item.slug + "?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW"}>Sweep floor</a>
                      <a target="_blank" rel="noreferrer" style={{ marginLeft: 24 }} href={"https://opensea.io/collection/" + item.slug + "?search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=IS_NEW"}>New NFTs</a>
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

export default CollectionPage;
