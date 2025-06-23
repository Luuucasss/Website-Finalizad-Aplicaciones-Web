// public/js/admin.js

// Refresca el listado de productos
async function refreshList() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) {
      const err = await res.json();
      console.error('API /api/products error:', err.error);
      document.getElementById('productList').innerHTML = '';
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.warn('Respuesta inesperada de productos:', data);
      document.getElementById('productList').innerHTML = '';
      return;
    }

    const html = data
      .map(
        (p) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${p.name} - $${p.price}
        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')">
          Eliminar
        </button>
      </li>
    `
      )
      .join('');

    document.getElementById('productList').innerHTML = html;
  } catch (err) {
    console.error('refreshList fallo:', err);
    document.getElementById('productList').innerHTML = '';
  }
}

// Elimina un producto
async function deleteProduct(id) {
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      console.error('API DELETE error:', err.error);
    }
    await refreshList();
  } catch (err) {
    console.error('deleteProduct fallo:', err);
  }
}

// Inserta un nuevo producto
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const body = {
    name: document.getElementById('name').value.trim(),
    price: parseFloat(document.getElementById('price').value),
    description: document.getElementById('description').value.trim(),
    image: document.getElementById('image').value.trim(),
  };

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('API POST error:', err.error);
    }

    e.target.reset();
    await refreshList();
  } catch (err) {
    console.error('addProduct fallo:', err);
  }
});

document.addEventListener('DOMContentLoaded', refreshList);
