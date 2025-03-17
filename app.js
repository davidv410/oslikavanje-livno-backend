const dotenv = require('dotenv').config()
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())
app.use(cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: true,
  }));

const productTypesRoute = require('./routes/productTypes')
app.use('/product-types', productTypesRoute)

const productsRoute = require('./routes/products')
app.use('/products', productsRoute)

const removeProductsRoute = require('./routes/removeProducts')
app.use('/remove-products', removeProductsRoute)

const addProductRoute = require('./routes/addProduct')
app.use('/add-product', addProductRoute) 

const loginRoute = require('./routes/login')
app.use('/login', loginRoute)

const updateProductRoute = require('./routes/updateProduct')
app.use('/update-product', updateProductRoute)

app.listen(5000, () => {
    console.log('Server started')
})