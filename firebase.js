import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9c3gBAo_ENpxC-reRiebauJXivjhP8D8",
  authDomain: "base-de-datos-4c1cd.firebaseapp.com",
  projectId: "base-de-datos-4c1cd",
  storageBucket: "base-de-datos-4c1cd.appspot.com",
  messagingSenderId: "452851254594",
  appId: "1:452851254594:web:fda7e2f51a253e651134db"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export const obtenerPedidos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pedidos'));
    return querySnapshot;  // Devolver el querySnapshot
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;  // Relanzar el error para que sea capturado en el llamador
  }
};

// Función para actualizar el estado del pedido en la base de datos
export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
  console.log('Pedido ID:', pedidoId);
  try {
    const pedidoDocRef = doc(db, 'pedidos', pedidoId);
    // Actualizar el campo 'usuario.estado' en el mapa
    await updateDoc(pedidoDocRef, { 'usuario.estado': nuevoEstado });
    console.log('Estado del pedido actualizado correctamente.');
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    throw error;
  }
};

export const deletePedido = async (pedidoId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    await deleteDoc(pedidoRef);
    console.log("Pedido eliminado correctamente desde Firestore");
  } catch (error) {
    console.error("Error al eliminar el pedido:", error);
  }
};

export const getForm = async () => {
  const querySnapshot = await getDocs(collection(db, 'productos'));
  return querySnapshot;
};


export const saveForm = (name, category, characteristics, quantity, price, img, img2) => {
  return addDoc(collection(db, "productos"), {
    name,
    category,
    characteristics,
    quantity,
    price,
    img,
    img2,
  });
};


export const updateProduct = async (productId, newData) => {
  const productRef = doc(db, "productos", productId);

  try {
    await updateDoc(productRef, newData);
    console.log("Producto actualizado con éxito");
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
  }
};

export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, 'productos', productId);
    await deleteDoc(productRef);
    console.log("Producto eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
  }
};

export const getProduct = async () => {
  const querySnapshot = await getDocs(collection(db, 'productos'));
  return querySnapshot;
};

export { db, auth };