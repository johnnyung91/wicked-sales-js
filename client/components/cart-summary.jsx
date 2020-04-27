import React from 'react';
import CartSummaryItem from './cart-summary-item';

export default class CartSummary extends React.Component {
  render() {
    const { cart, setView } = this.props;
    const totalPrice = cart.reduce((max, cur) => {
      return max + cur.price;
    }, 0) / 100;
    let summary = null;
    let button = null;

    if (cart.length === 0) {
      summary = <h2>Your Shopping Cart is empty</h2>;
    } else {
      summary = cart.map(cartItem => {
        return (
          <CartSummaryItem
            key={cartItem.cartItemId}
            cartItem={cartItem}
          />
        );
      });
      button =
      (<div>
        <button type="button" className="btn btn-primary" onClick={() => setView('checkout', {})}>Checkout</button>
      </div>);
    }

    return (

      <div className="container py-5 px-0">
        <div className="container">
          <div className="d-inline-block pb-3 pointer" onClick={() => setView('catalog', {})}>
            <p><i className="fas fa-arrow-left pr-2"></i>Back to Catalog</p>
          </div>
          <div className="py-3">
            <h1>My Cart</h1>
          </div>
          <div className="py-3">
            {summary}
          </div>
          <div className="container d-flex justify-content-between align-items-center py-3 px-0">
            <div>
              <h3>
                Cart Total: <span className="text-secondary">${totalPrice.toFixed(2)}</span>
              </h3>
            </div>
            {button}
          </div>
        </div>
      </div>
    );
  }
}
