const fs = require('fs/promises')

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

    async updateAutoIncrementId() {
        const maxId = this.carts.reduce((max, cart) => (cart.id > max ? cart.id : max), 0)
        this.autoIncrementId = maxId + 1
    }

    async saveCartsToFile() {
        console.log("Guardando carritos en el archivo...")
        const data = JSON.stringify(this.carts, null, 2)
        await fs.writeFile(this.path, data, 'utf8')
        console.log("Carritos guardados con éxito.")
    }

    async addCart(cart) {
        const newCart = {
            id: this.autoIncrementId++,
            products: [],
        }

        this.carts.push(newCart)
        await this.saveCartsToFile()
        console.log("Carrito creado:", newCart)

        return newCart // Devolvemos el nuevo carrito
    }


    async getCartById(id) {
        const cart = this.carts.find(existingCart => existingCart.id === id)

        if (!cart) {
            throw new Error("Carrito no encontrado")
        }

        return cart
    }

    async getProductsInCart(cartId) {
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

        this.saveCartsToFile()
        console.log("Producto agregado al carrito:", { cartId, productId, quantity })
    }
}

module.exports = CartManager