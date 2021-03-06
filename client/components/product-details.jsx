import React from 'react';
import AddItemModal from './add-item-modal';

export default class ProductDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      itemAdded: false
    };
    this.itemAdded = this.itemAdded.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const { productId } = this.props.match.params;
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => this.setState({ product: data }))
      .catch(err => console.error(err));
  }

  itemAdded(product) {
    this.props.addToCart(product);
    this.setState({ itemAdded: !this.state.itemAdded });
  }

  closeModal() {
    this.setState({
      itemAdded: !this.state.itemAdded
    });
  }

  render() {
    const { product, itemAdded } = this.state;

    if (!product) {
      return null;
    } else {
      const currency = parseFloat((product.price / 100).toFixed(2));
      return (
        <>
          {itemAdded ? <AddItemModal product={product} closeModal={this.closeModal}/> : null}
          <div className="container py-5 fade-in">
            <div className="container p-4 border rounded-lg shadow">
              <div className="d-inline-block pb-3 pointer d-" onClick={() => this.props.history.push('/')}>
                <p>
                  <i className="fas fa-arrow-left pr-2"></i>
                Back to Catalog
                </p>
              </div>
              <div className="row pb-3">
                <div className="col-lg-5 px-3 pb-3 text-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="fit"/>
                </div>
                <div className="col-lg-7 pb-3 d-flex align-items-center">
                  <div className='details-text'>
                    <h5>{product.name}</h5>
                    <h6 className="text-muted">${currency.toLocaleString('en')}</h6>
                    <p>{product.shortDescription}</p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => this.itemAdded(product)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
              <div className="long-description">
                <h5>Description</h5>
                <p>{product.longDescription}</p>
              </div>
            </div>
          </div>
        </>
      );
    }
  }
}
