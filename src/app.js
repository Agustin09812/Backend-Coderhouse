const express = require('express')
const fs = require('fs/promises')

class ProductManager {
  constructor(path) {
    this.path = path
    this.products = []
    this.autoIncrementId = 1

    // Leemos los productos del archivo al instanciar la clase
    this.loadProductsFromFile().then(() => {
      // Inicialización del ProductManager
      this.updateAutoIncrementId()
    })
  }

  async loadProductsFromFile() {
    try {
      // Intentamos leer el contenido del archivo y cargarlo en la propiedad 'products'
      const data = await fs.readFile(this.path, 'utf8')
      this.products = JSON.parse(data)
      this.updateAutoIncrementId()
    } catch (error) {
      // Si hay un error al leer el archivo (puede ser que no exista), mostramos el error
      console.error("Error al cargar productos desde el archivo:", error.message)
      // Inicializamos 'products' con un array vacío
      this.products = []
    }
  }

  updateAutoIncrementId() {
    const maxId = this.products.reduce((max, product) => (product.id > max ? product.id : max), 0)
    this.autoIncrementId = maxId + 1
  }

  async saveProductsToFile() {
    console.log("Guardando productos en el archivo...")
    // Guardamos productos en el archivo en formato JSON
    const data = JSON.stringify(this.products, null, 2)
    await fs.writeFile(this.path, data, 'utf8')
    console.log("Productos guardados con éxito.")
  }

  addProduct(product) {
    if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
      console.error("Todos los campos son obligatorios")
      return
    }

    if (this.products.some(existingProduct => existingProduct.code === product.code)) {
      console.error("Ya existe un producto con el mismo código")
      return
    }

    // Creamos un nuevo producto con un id autoincremental y lo agregamos al array de productos
    const newProduct = {
      id: this.autoIncrementId++,
      title: product.title,
      description: product.description,
      price: product.price,
      thumbnail: product.thumbnail,
      code: product.code,
      stock: product.stock,
    }

    this.products.push(newProduct)
    this.saveProductsToFile()
    console.log("Producto agregado:", newProduct)
  }

  getProducts(limit) {
    return limit ? this.products.slice(0, limit) : this.products
  }

  getProductById(id) {
    // Buscamos un producto por su id
    const product = this.products.find(existingProduct => existingProduct.id === id)
    if (!product) {
      throw new Error("Producto no encontrado")
    }

    return product
  }

  updateProduct(id, updatedFields) {
    console.log("Actualizando producto. ID:", id, "Campos actualizados:", updatedFields)
    // Buscamos el índice del producto que coincide con el id proporcionado
    const index = this.products.findIndex(product => product.id === id)
    if (index === -1) {
      throw new Error("Producto no encontrado")
    }
    // Actualizamos los campos del producto sin borrar el id y guardamos los cambios en el archivo
    this.products[index] = {
      ...this.products[index],
      ...updatedFields,
      id,
    }

    this.saveProductsToFile()
    console.log("Producto actualizado:", this.products[index])
  }

  deleteProduct(id) {
    // Buscamos el índice del producto que coincide con el id proporcionado
    const index = this.products.findIndex(product => product.id === id)
    if (index === -1) {
      throw new Error("Producto no encontrado")
    }
    // Eliminamos el producto del array y guardamos los cambios en el archivo
    const deletedProduct = this.products.splice(index, 1)[0]
    this.saveProductsToFile()
    console.log("Producto eliminado:", deletedProduct)
  }
}

class CartManager {
  constructor(path) {
    this.path = path
    this.carts = []
    this.autoIncrementId = 1
    // Leemos los carritos del archivo al instanciar la clase
    this.loadCartsFromFile()
  }

  async loadCartsFromFile() {
    try {
      const data = await fs.readFile(this.path, 'utf8')
      this.carts = JSON.parse(data)
      // Verificamos si lo cargado es un array, si no, inicializamos carts como un array vacío
      if (!Array.isArray(this.carts)) {
        this.carts = []
      }
      this.updateAutoIncrementId()
    } catch (error) {
      console.error("Error al cargar carritos desde el archivo:", error.message)
      this.carts = []
    }
  }

  updateAutoIncrementId() {
    const maxId = this.carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0)
    this.autoIncrementId = maxId + 1
  }

  async saveCartsToFile() {
    console.log("Guardando carritos en el archivo...")
    const data = JSON.stringify(this.carts, null, 2)
    await fs.writeFile(this.path, data, 'utf8')
    console.log("Carritos guardados con éxito.")
  }

  addCart(cart) {
    const newCart = {
      id: this.autoIncrementId++,
      products: [],
    }

    this.carts.push(newCart)
    this.saveCartsToFile()
    console.log("Carrito creado:", newCart)
  }

  getCartById(id) {
    const cart = this.carts.find(existingCart => existingCart.id === id)

    if (!cart) {
      throw new Error("Carrito no encontrado")
    }

    return cart
  }

  getProductsInCart(cartId) {
    const cart = this.getCartById(cartId)
    return cart.products
  }

  addProductToCart(cartId, productId, quantity) {
    const cart = this.getCartById(cartId)
    const existingProduct = cart.products.find(product => product.id === productId)

    if (existingProduct) {
      existingProduct.quantity += quantity
    } else {
      cart.products.push({ id: productId, quantity })
    }

    this.saveCartsToFile()
    console.log("Producto agregado al carrito:", { cartId, productId, quantity })
  }
}

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
    await productManager.addProduct(newProduct)
    res.status(201).json({ message: "Producto agregado con éxito" })
  } catch (error) {
    next(error)
  }
})

app.put('/products/:pid', async (req, res, next) => {
  try {
    const productId = parseInt(req.params.pid)
    const updatedFields = req.body
    await productManager.updateProduct(productId, updatedFields)
    res.json({ message: "Producto actualizado con éxito" })
  } catch (error) {
    next(error)
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
    await cartManager.addCart(req.body)
    res.status(201).json({ message: "Carrito creado con éxito" })
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

    await cartManager.addProductToCart(cartId, productId, quantity)
    res.json({ message: "Producto agregado al carrito con éxito" })
  } catch (error) {
    next(error)
  }
})

app.listen(port, async () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`)
})