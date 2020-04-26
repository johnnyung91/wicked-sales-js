import React from 'react';

function CartSummaryItem(props) {
  const { cartItem } = props;
  const currency = (cartItem.price / 100).toFixed(2);
  return (
    <div className="py-3">
      <div className="container px-4 border rounded-lg shadow">
        <div className="row">
          <div className="col-lg-4 p-2 text-center">
            <img
              src={cartItem.image}
              alt={cartItem.name}
              className="fit p-2"/>
          </div>
          <div className="col-lg-8 d-flex flex-column justify-content-center summary">
            <h3>{cartItem.name}</h3>
            <p className="text-muted">${currency}</p>
            <p>{cartItem.shortDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartSummaryItem;
