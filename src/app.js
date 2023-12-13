const express = require('express')
const fs = require('fs/promises')
const ProductManager = require('./productManager');
const CartManager = require('./cartManager');

const app = express()
const port = 8080

const productManager = new ProductManager('productos.json')
const cartManager = new CartManager('carritos.json')

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Servidor Express')
})

// Rutas para productos
app.get('/products', async (req, res, next) => {
  try {
    const limit = req.query.limit
    const products = await productManager.getProducts(limit)
    res.json(products)
  } catch (error) {
    next(error)
  }
})

app.get('/products/:pid', async (req, res, next) => {
  try {
    const productId = parseInt(req.params.pid)
    const product = await productManager.getProductById(productId)
    res.json(product)
  } catch (error) {
    next(error)
  }
})

app.post('/products', async (req, res, next) => {
  try {
    const newProduct = req.body
    const addedProduct = await productManager.addProduct(newProduct)

    res.status(201).json({
      message: `Nuevo producto agregado con id: ${addedProduct.id} dentro de productos.json`
    })
  } catch (error) {
    next(error)
  }
})

app.put('/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid)
    const product = req.body
    await productManager.updateProduct(productId, product)
    res.json({ message: "Producto actualizado con éxito" })
  } catch (error) {
    console.log('error', err)
  }
})

app.delete('/products/:pid', async (req, res, next) => {
  try {
    const productId = parseInt(req.params.pid)
    await productManager.deleteProduct(productId)
    res.json({ message: "Producto eliminado con éxito" })
  } catch (error) {
    next(error)
  }
})

// Rutas para carritos
app.post('/carts', async (req, res, next) => {
  try {
    const newCart = await cartManager.addCart(req.body)
    res.status(201).json({ message: `Carrito con ID ${newCart.id} creado con éxito en el archivo carritos.json` })
  } catch (error) {
    next(error)
  }
})


app.get('/carts/:cid', async (req, res, next) => {
  try {
    const cartId = parseInt(req.params.cid)
    const productsInCart = await cartManager.getProductsInCart(cartId)
    res.json(productsInCart)
  } catch (error) {
    next(error)
  }
})

app.post('/carts/:cid/product/:pid', async (req, res, next) => {
  try {
    const cartId = parseInt(req.params.cid)
    const productId = parseInt(req.params.pid)
    const quantity = req.body.quantity !== undefined ? req.body.quantity : 1

    // Obtener la información del producto por ID
    const product = await productManager.getProductById(productId)

    // Agregar el producto al carrito
    await cartManager.addProductToCart(cartId, productId, quantity)

    // Construir el mensaje con el título del producto
    const message = `Producto agregado al carrito: ${cartId}, ${product.title}, Cantidad: ${quantity}`

    res.json({ message })
  } catch (error) {
    next(error)
  }
})


app.listen(port, async () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`)
})