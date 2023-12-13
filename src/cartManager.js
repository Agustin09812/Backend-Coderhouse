const fs = require('fs')

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
            const data = fs.readFileSync(this.path, 'utf8')
            this.carts = JSON.parse(data)
            // Verificamos si lo cargado es un array, si no, inicializamos carts como un array vacío
            if (!Array.isArray(this.carts)) {
                this.carts = []
            }
            this.updateAutoIncrementId()
        } catch (error) {
            console.error("Error loading carts from file:", error.message)
            this.carts = []
        }
    }

    async updateAutoIncrementId() {
        const maxId = this.carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0)
        this.autoIncrementId = maxId + 1
    }

    async addCart(cart) {
        const newCart = {
            id: this.autoIncrementId++,
            products: [],
        }

        this.carts.push(newCart)
        await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf8')
        console.log("Cart created:", newCart)

        return newCart // Devolvemos el nuevo carrito
    }

    getCartById(id) {
        const cart = this.carts.find(existingCart => existingCart.id === id)

        if (!cart) {
            throw new Error("Cart not found")
        }

        return cart
    }

    getProductsInCart(cartId) {
        const cart = this.getCartById(cartId)
        return cart.products
    }

    async addProductToCart(cartId, productId, quantity) {
        const cart = this.getCartById(cartId)
        const existingProduct = cart.products.find(product => product.id === productId)

        if (existingProduct) {
            existingProduct.quantity += quantity
        } else {
            cart.products.push({ id: productId, quantity })
        }

        await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, 2), 'utf8')
        console.log("Product added to cart:", { cartId, productId, quantity })
    }
}

module.exports = CartManager