import { auth, db, storage } from "../firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let productos = [];

// =========================
// ELEMENTOS
// =========================
const form = document.getElementById("register-form");
const editForm = document.getElementById("edit-form");
const table = document.getElementById("table");

// =========================
// AUTH CHECK
// =========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Usuario autenticado:", user.email);
    loadProducts();
  } else {
    console.error("❌ Usuario NO autenticado");
  }
});

// =========================
// SUBIR IMAGEN
// =========================
async function uploadImage(file) {
  const fileName = `productos/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// =========================
// REGISTRAR PRODUCTO
// =========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const data = new FormData(form);

    let imgUrl = data.get("img");
    let img2Url = data.get("img2");

    const imgFile = data.get("imgFile");
    const imgFile2 = data.get("imgFile2");

    if (imgFile && imgFile.size > 0) {
      imgUrl = await uploadImage(imgFile);
    }

    if (imgFile2 && imgFile2.size > 0) {
      img2Url = await uploadImage(imgFile2);
    }

    const product = {
      name: data.get("name"),
      category: data.get("category"),
      characteristics: data.get("characteristics"),
      quantity: Number(data.get("quantity")),
      price: Number(data.get("price")),
      currency: data.get("currency"),
      img: imgUrl || "",
      img2: img2Url || "",
      createdAt: new Date(),
    };

    await addDoc(collection(db, "productos"), product);

    alert("✅ Producto registrado correctamente");
    form.reset();
    loadProducts();
  } catch (error) {
    console.error("❌ Error al registrar producto:", error);
  }
});

// =========================
// CARGAR PRODUCTOS
// =========================
async function loadProducts() {
  const snapshot = await getDocs(collection(db, "productos"));

  productos = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  renderTable(productos);
}

// =========================
// RENDER TABLA
// =========================
function renderTable(products) {
  table.innerHTML = `
    <thead class="table-dark">
      <tr>
        <th>Nombre</th>
        <th>Categoría</th>
        <th>Características</th>
        <th>Precio</th>
        <th>Cantidad</th>
        <th>Imagen 1</th>
        <th>Imagen 2</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      ${
        products.length === 0
          ? `<tr><td colspan="8" class="text-center">Sin productos</td></tr>`
          : products
              .map(
                (p) => `
            <tr>
              <td>${p.name}</td>
              <td>${p.category}</td>
              <td>${p.characteristics}</td>
              <td>${p.currency === "USD" ? "USD" : "$"} ${p.price}</td>
              <td>${p.quantity}</td>
              <td>
                ${p.img ? `<img src="${p.img}" width="70">` : "-"}
              </td>
              <td>
                ${p.img2 ? `<img src="${p.img2}" width="70">` : "-"}
              </td>
              <td>
                <button
                  class="btn btn-warning btn-sm me-1"
                  data-bs-toggle="modal"
                  data-bs-target="#editCustomer"
                  onclick="editProduct('${p.id}')">
                  <i class="bi bi-pencil"></i>
                </button>

                <button
                  class="btn btn-danger btn-sm"
                  onclick="deleteProduct('${p.id}')">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          `,
              )
              .join("")
      }
    </tbody>
  `;
}

// =========================
// EDITAR PRODUCTO (CARGAR MODAL)
// =========================
window.editProduct = async function (id) {
  const snapshot = await getDocs(collection(db, "productos"));
  const product = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .find((p) => p.id === id);

  if (!product) return;

  document.getElementById("edit-id").value = product.id;
  editForm.name.value = product.name;
  editForm.category.value = product.category;
  editForm.characteristics.value = product.characteristics;
  editForm.quantity.value = product.quantity;
  document.getElementById("edit-price").value = product.price;
  document.getElementById("edit-currency").value = product.currency || "ARS";
  editForm.img.value = product.img || "";
  editForm.img2.value = product.img2 || "";
};

// =========================
// GUARDAR EDICIÓN
// =========================
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const data = new FormData(editForm);

  let imgUrl = data.get("img");
  let img2Url = data.get("img2");

  const imgFile = data.get("imgFile");
  const imgFile2 = data.get("imgFile2");

  // 👉 Si se selecciona archivo nuevo, se sube
  if (imgFile && imgFile.size > 0) {
    imgUrl = await uploadImage(imgFile);
  }

  if (imgFile2 && imgFile2.size > 0) {
    img2Url = await uploadImage(imgFile2);
  }

  const updatedProduct = {
    name: data.get("name"),
    category: data.get("category"),
    characteristics: data.get("characteristics"),
    quantity: Number(data.get("quantity")),
    price: Number(data.get("edit-price")),
    currency: data.get("edit-currency"),
    img: imgUrl || "",
    img2: img2Url || "",
  };
  await updateDoc(doc(db, "productos", id), updatedProduct);
  bootstrap.Modal.getInstance(document.getElementById("editCustomer")).hide();
  loadProducts();
});
// =========================
// ELIMINAR PRODUCTO
// =========================
window.deleteProduct = async function (id) {
  if (!confirm("¿Eliminar producto?")) return;

  await deleteDoc(doc(db, "productos", id));
  loadProducts();
};

// =========================
// BUSCAR PRODUCTOS
// =========================
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

function buscarProductos() {
  const value = searchInput.value.toLowerCase().trim();

  const filtrados = productos.filter((p) =>
    p.name.toLowerCase().includes(value),
  );

  renderTable(filtrados);
}
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase().trim();

  if (!value) {
    renderTable(productos);
    return;
  }

  const filtrados = productos.filter((p) =>
    p.name.toLowerCase().includes(value),
  );

  renderTable(filtrados);
});
searchInput.addEventListener("input", buscarProductos);

// =========================
// CERRAR SESIÓN
// =========================
const logoutBtn = document.getElementById("logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("✅ Sesión cerrada");
      window.location.href = "../index.html";
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  });
}
