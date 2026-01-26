import {
  saveForm,
  deleteProduct,
  updateProduct,
  getProduct,
  auth,
} from "../firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const table = document.getElementById("table");
  const registerForm = document.getElementById("register-form");
  const editForm = document.getElementById("edit-form");
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");

  let allProducts = [];

  await loadProducts();

  // ==========================
  // REGISTRAR PRODUCTO
  // ==========================
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    const product = Object.fromEntries(formData);

    const docRef = await saveForm(
      product.name,
      product.category,
      product.characteristics,
      product.quantity,
      product.price,
      product.img,
      product.img2,
    );

    console.log("Producto creado con ID:", docRef.id);

    registerForm.reset();
    await loadProducts();
  });

  // ==========================
  // EDITAR PRODUCTO
  // ==========================
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productId = document.getElementById("edit-id").value;
    console.log("Actualizando producto:", productId);

    if (!productId) {
      alert("Error: ID del producto no encontrado");
      return;
    }

    const updatedData = {
      name: editForm.name.value,
      category: editForm.category.value,
      characteristics: editForm.characteristics.value,
      quantity: Number(editForm.quantity.value),
      price: Number(editForm.price.value),
      img: editForm.img.value,
      img2: editForm.img2.value,
    };

    await updateProduct(productId, updatedData);
    await loadProducts();

    bootstrap.Modal.getInstance(document.getElementById("editCustomer")).hide();

    editForm.reset();
    document.getElementById("edit-id").value = "";
  });

  // ==========================
  // BUSCAR PRODUCTOS
  // ==========================
  searchButton.addEventListener("click", () => {
    const term = searchInput.value.toLowerCase().trim();

    if (!term) {
      renderTable(allProducts);
      return;
    }

    const filtered = allProducts.filter((p) =>
  [
    p.name,
    p.category,
    p.characteristics
  ]
    .filter(Boolean)
    .some((field) =>
      field.toLowerCase().includes(term)
    )
);


    renderTable(filtered);
  });

  searchInput.addEventListener("input", () => {
    searchButton.click();
  });

  // ==========================
  // CARGAR PRODUCTOS
  // ==========================
  async function loadProducts() {
    const snapshot = await getProduct();
    allProducts = [];

    snapshot.forEach((doc) => {
      allProducts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    renderTable(allProducts);
  }

  // ==========================
  // RENDER TABLA
  // ==========================
  function renderTable(products) {
    table.innerHTML = "";

    const columns = [
      "Nombre",
      "Categoría",
      "Características",
      "Cantidad",
      "Precio",
      "Imagen 1",
      "Imagen 2",
      "Acciones",
    ];

    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    columns.forEach((c) => {
      const th = document.createElement("th");
      th.textContent = c;
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    products.forEach((product) => {
      const row = document.createElement("tr");

      row.innerHTML = `
  <td>${product.name}</td>
  <td>${product.category}</td>
  <td>${product.characteristics}</td>
  <td>${product.quantity}</td>
  <td>$${product.price}</td>
  <td><img src="${product.img}" width="80"></td>
  <td><img src="${product.img2}" width="80"></td>
  <td>
    <button class="btn btn-warning btn-edit" data-bs-toggle="modal" data-bs-target="#editCustomer">
      <i class="bi bi-pencil"></i>
    </button>
    <button class="btn btn-danger btn-delete">
      <i class="bi bi-trash"></i>
    </button>
  </td>
`;

      row.querySelector(".btn-edit").addEventListener("click", () => {
        fillEditForm(product);
      });

      row.querySelector(".btn-delete").addEventListener("click", async () => {
        if (confirm("¿Eliminar producto?")) {
          await deleteProduct(product.id);
          await loadProducts();
        }
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
  }

  // ==========================
  // CARGAR FORM EDICIÓN
  // ==========================
  function fillEditForm(product) {
    console.log("Editando producto ID:", product.id);

    document.getElementById("edit-id").value = product.id;

    editForm.name.value = product.name;
    editForm.category.value = product.category;
    editForm.characteristics.value = product.characteristics;
    editForm.quantity.value = product.quantity;
    editForm.price.value = product.price;
    editForm.img.value = product.img;
    editForm.img2.value = product.img2;
  }

  // ==========================
  // LOGOUT
  // ==========================
  const logout = document.querySelector("#logout");

  logout.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      // Cerrar sesión con Firebase
      await signOut(auth);
      console.log('Usuario ha cerrado sesión');
      
      // Redirigir al login
      window.location.href = "../index.html";
    } catch (error) {
      console.log('Error al cerrar sesión:', error);
    }
  });
});
