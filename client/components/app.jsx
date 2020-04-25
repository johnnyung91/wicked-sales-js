import React from 'react';
import Header from './header';
import ProductList from './product-list';
import ProductDetails from './product-details';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: {
        name: 'catalog',
        params: {},
        cart: []
      }
    };
    this.setView = this.setView.bind(this);
    this.getCartItems = this.getCartItems.bind(this);
  }

  componentDidMount() {
    this.getCartItems();
  }

  setView(name, params) {
    this.setState({
      view: {
        name: name,
        params: { productId: params }
      }
    });
  }

  getCartItems() {
    fetch('/api/cart')
      .then(res => res.json())
      .then(itemsInCart => this.setState({
        cart: itemsInCart
      }))
      .catch(err => console.error(err));
  }

  addToCart(product) {
    // const init =
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/JSON'
    //     },
    //     body: JSON.stringify(product)
    //   };

    // fetch('/api/cart', init);
  }

  render() {
    const { name, params, cart } = this.state.view;

    let main;
    if (name === 'catalog') main = <ProductList setView={this.setView}/>;
    if (name === 'details') main = <ProductDetails params={params} setView={this.setView}/>;

    return (
      <>
        <header>
          <Header cartItemCount={cart}/>
        </header>
        <main>
          {main}
        </main>
      </>
    );
  }
}
