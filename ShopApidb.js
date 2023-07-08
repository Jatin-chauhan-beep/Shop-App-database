let express = require("express");
let app = express();
let fs = require("fs");
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Listening on port ${port}!`));

const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  password: "shopapp123.",
  database: "postgres",
  port: 5432,
  host: "db.lzivhyqacswnrjlgtogu.supabase.co",
  ssl: { rejectUnauthorized: false },
});
client.connect(function (res, error) {
  console.log("Connected!!!");
});

app.get("/products/:category?", (req, res) => {
  let category = req.params.category;
  let sql;
  if (category) {
    sql = "SELECT * FROM products WHERE category=$1";
    client.query(sql, [category], (err, result) => {
      if (err) res.status(404).send(err);
      else res.send(result.rows);
    });
  } else {
    sql = "SELECT * FROM products";
    client.query(sql, (err, result) => {
      if (err) res.status(404).send(err);
      else res.send(result.rows);
    });
  }
});

app.get("/product/:id", (req, res) => {
  let Id = +req.params.id;
  let sql = "SELECT * FROM products WHERE id=$1 ";
  client.query(sql, [Id], (err, result) => {
    if (err) res.status(404).send(err);
    else {
      let product = JSON.parse(JSON.stringify(result.rows));
      res.send(product);
    }
  });
});

app.post("/products", (req, res) => {
  let body = Object.values(req.body);
  let sql =
    "INSERT INTO products (name,price,category,imagelink,description) VALUES ($1,$2,$3,$4,$5)";
  client.query(sql, body, (err, result) => {
    if (err) res.status(404).send(err);
    else res.send(body);
  });
});

app.put("/products/:id", (req, res) => {
  let body = req.body;
  let id = +req.params.id;
  let sql =
    "UPDATE products SET name=$1,price=$2,category=$3,imagelink=$4,description=$5 WHERE id=$6 ";
  client.query(
    sql,
    [
      body.name,
      body.price,
      body.category,
      body.imagelink,
      body.description,
      id,
    ],
    (err) => {
      if (err) res.status(404).send(err);
      else res.send(body);
    }
  );
});

app.delete("/products/:id", (req, res) => {
  let id = +req.params.id;
  let sql = "DELETE FROM products WHERE id=$1";
  client.query(sql, [id], (err) => {
    if (err) res.status(404).send(err);
    else res.send("Product Deleted");
  });
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let sql = "SELECT * FROM customers WHERE email=$1 AND password=$2";
  client.query(sql, [email, password], (err, result) => {
    if (err) res.status(404).send(err);
    else {
      if (result) res.send(result.rows[0]);
      else res.status(404).send("not Found");
    }
  });
});

app.post("/register", (req, res) => {
  let { email, password } = req.body;

  let sql = "SELECT * FROM customers WHERE email=$1 AND password=$2";
  client.query(sql, [email, password], (err, result) => {
    if (err) res.status(404).send(err);
    else {
      if (result.rows[0]) {
        res.send(result.rows[0]);
      } else {
        let sql1 = "INSERT INTO customers (email,password) VALUES ($1,$2)";
        client.query(sql1, [email, password], (err, result) => {
          if (err) res.status(404).send(err);
          else res.send("");
        });
      }
    }
  });
});

app.post("/orders", (req, res) => {
  let body = Object.values(req.body);
  let sql =
    "INSERT INTO orders (name,address1,address2,city,totalprice,items,email) VALUES ($1,$2,$3,$4,$5,$6,$7)";
  client.query(sql, body, (err) => {
    if (err) res.status(404).send(err);
    else res.send(body);
  });
});

app.get("/orders/:email", (req, res) => {
  let email = req.params.email;
  let sql = "SELECT * FROM orders WHERE email=$1";
  client.query(sql, [email], (err, result) => {
    if (err) res.status(404).send(err);
    else res.send(result.rows);
  });
});
