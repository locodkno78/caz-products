import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9c3gBAo_ENpxC-reRiebauJXivjhP8D8",
  authDomain: "base-de-datos-4c1cd.firebaseapp.com",
  projectId: "base-de-datos-4c1cd",
  storageBucket: "base-de-datos-4c1cd.appspot.com",
  messagingSenderId: "452851254594",
  appId: "1:452851254594:web:fda7e2f51a253e651134db"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


// ==========================
// 📸 SUBIR IMAGEN
// ==========================
export const subirImagen = async (file) => {
  if (!file) return "";

  const cleanName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  const storageRef = ref(
    storage,
    `productos/${Date.now()}_${cleanName}`
  );

  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// ==========================
// 📦 PRODUCTOS
// ==========================
export const saveForm = (
  name,
  category,
  characteristics,
  quantity,
  price,
  img,
  img2
) => {
  return addDoc(collection(db, "productos"), {
    name,
    category,
    characteristics,
    quantity,
    price,
    img,
    img2,
    createdAt: new Date()
  });
};

export const getProduct = async () => {
  return await getDocs(collection(db, "productos"));
};

export const updateProduct = async (id, data) => {
  const refDoc = doc(db, "productos", id);
  await updateDoc(refDoc, data);
};

export const deleteProduct = async (id) => {
  const refDoc = doc(db, "productos", id);
  await deleteDoc(refDoc);
};



