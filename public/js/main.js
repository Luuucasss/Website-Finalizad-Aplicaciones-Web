async function loadProducts(filters = {}) {
  const qs = new URLSearchParams(filters).toString();
  const res = await fetch(`/api/products?${qs}`);
  const data = await res.json();
  const container = document.getElementById("productsContainer");

  if (!res.ok) {
    container.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
    return;
  }

  container.innerHTML = data
    .map(
      (p) => `
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body">
          <h5 class="card-title">${p.name}</h5>
          <p class="card-text">${p.description}</p>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <strong class="me-2">$${p.price}</strong>
          <button
            class="btn btn-sm btn-primary buy-btn"
            data-id="${p.id}"
            data-name="${p.name}"
            data-price="${p.price}"
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.trim();
      loadProducts(term ? { name: term } : {});
    });
  }

  // Manejador de “Comprar”
  const container = document.getElementById("productsContainer");
  container.addEventListener("click", (e) => {
    if (!e.target.classList.contains("buy-btn")) return;
    const name = e.target.dataset.name;
    const price = e.target.dataset.price;
    alert(`¡Gracias por tu compra!\n\nArtículo: ${name}\nPrecio: $${price}`);
  });
});
