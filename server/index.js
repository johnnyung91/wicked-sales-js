require('dotenv/config');
const express = require('express');

const db = require('./database');
const ClientError = require('./client-error');
const staticMiddleware = require('./static-middleware');
const sessionMiddleware = require('./session-middleware');

const app = express();

app.use(staticMiddleware);
app.use(sessionMiddleware);

app.use(express.json());

// view products back end
app.get('/api/products', (req, res, next) => {
  const sql = `
    select "productId",
      "name",
      "price",
      "image",
      "shortDescription"
    from "products"
  `;

  db.query(sql)
    .then(result => {
      const products = result.rows;
      res.status(200).json(products);
    })
    .catch(err => next(err));
});

// View product details by productId
app.get('/api/products/:productId', (req, res, next) => {
  const { productId } = req.params;
  if (!parseInt(productId, 10)) {
    return next(new ClientError('"productId" must be a positive integer', 400));
  }

  const sql = `
  select "productId",
    "name",
    "price",
    "image",
    "shortDescription",
    "longDescription"
  from "products"
  where "productId" = $1
  `;

  db.query(sql, [productId])
    .then(result => {
      const product = result.rows[0];
      if (!product) {
        next(new ClientError(`Cannot find grade with "productId" ${productId}`, 404));
      } else {
        res.json(product);
      }
    })
    .catch(err => next(err));
});

// GET endpoint for cart
app.get('/api/cart', (req, res, next) => {
  const { cartId } = req.session;
  if (!cartId) {
    res.json([]);
  } else {
    const sql = `
    select "c"."cartItemId",
      "c"."price",
      "p"."productId",
      "p"."image",
      "p"."name",
      "p"."shortDescription"
    from "cartItems" as "c"
    join "products" as "p" using ("productId")
    where "c"."cartId" = $1
    `;
    const values = [cartId];
    db.query(sql, values)
      .then(cartResult => {
        const cartItem = cartResult.rows;
        res.json(cartItem);
      });
  }
});

// POST endpoint for cart
app.post('/api/cart', (req, res, next) => {
  const { productId } = req.body;
  if (isNaN(productId) || productId <= 0) {
    return next(new ClientError('"productId" must be a positive integer', 400));
  }

  const sql = `
    select "price"
    from "products"
    where "productId" = $1
  `;
  const values = [productId];
  db.query(sql, values)
    // FIRST THEN
    .then(getPriceResult => {
      if (!getPriceResult.rows[0]) throw new ClientError('productId does not exist', 400);
      const { price } = getPriceResult.rows[0]; // gets value of price
      if (req.session.cartId) {
        const cartResult = {
          cartId: req.session.cartId,
          price: price
        };
        return cartResult; // creating a cartResult if req.session.cartId exists
      } else {
        const sql = `
          insert into "carts" ("cartId", "createdAt")
          values (default, default)
          returning "cartId"
        `;
        return db.query(sql)
          .then(getCartResult => {
            const { cartId } = getCartResult.rows[0]; // gets value of cartId
            const cartResult = {
              cartId: cartId,
              price: price
            };
            return cartResult; // creating a cartResult if req.sessions.cartId doesnt exist
          });
      }
    })
    // SECOND THEN
    .then(createCartItemResult => {
      const { cartId, price } = createCartItemResult; // cartId and price from previous step
      req.session.cartId = cartId;

      const sql = `
        insert into "cartItems" ("cartId", "productId", "price")
        values ($1, $2, $3)
        returning "cartItemId"
      `;
      const values = [cartId, productId, price];
      return db.query(sql, values); // creating a cartItemResult
    })
    // THIRD THEN
    .then(getCartItemResult => {
      const { cartItemId } = getCartItemResult.rows[0]; // gets cartItemId from cartItemResult
      const sql = `
        select "c"."cartItemId",
          "c"."price",
          "p"."productId",
          "p"."image",
          "p"."name",
          "p"."shortDescription"
        from "cartItems" as "c"
        join "products" as "p" using ("productId")
        where "c"."cartItemId" = $1
      `;
      const values = [cartItemId];
      return db.query(sql, values)
        .then(result => { // send final cartItem as a response
          const cartItem = result.rows[0];
          res.status(201).json(cartItem);
        });
    })
    .catch(err => next(err));
});

app.use('/api', (req, res, next) => {
  next(new ClientError(`cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use((err, req, res, next) => {
  if (err instanceof ClientError) {
    res.status(err.status).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({
      error: 'an unexpected error occurred'
    });
  }
});

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on port', process.env.PORT);
});
