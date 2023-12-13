## Agregar un Nuevo Producto: (Método POST)

URL: http://localhost:8080/products


Cuerpo de la Solicitud (raw, JSON):

```
{
  "title": "Nuevo Producto",
  "description": "Descripción del nuevo producto",
  "price": 19.99,
  "stock": 100
}
```

## Visualizar Todos los Productos (Método GET)

URL: http://localhost:8080/products


Al clickear "Send" verifica que recibas una lista de todos los productos.

## Visualizar un Producto Específico (Método GET)

URL: http://localhost:8080/products/{id}


Reemplaza {id} con el ID del producto que quieras visualizar.

## Actualizar un Producto (Método PUT)

URL: http://localhost:8080/products/{id}


Reemplaza {id} con el ID del producto que quieras actualizar.


Cuerpo de la Solicitud (raw, JSON):

```
{
  "title": "Nuevo Título",
  "description": "Nueva descripción",
  "price": 24.99
}
```

## Eliminar un Producto (Método DELETE)

URL: http://localhost:8080/products/{id}


Reemplaza {id} con el ID del producto que quieras eliminar.
