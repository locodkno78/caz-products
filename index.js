import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { showMessage } from "./showMessage.js";

const signInForm = document.querySelector("#login-form");

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  // Obtener los valores de los campos  
  const email = signInForm["email"].value;
  const password = signInForm["password"].value;

  // Verifica que los campos no estén vacíos
  if (!email || !password) {
    showMessage("Por favor, complete todos los campos.", "error");
    return;
  }

  try {
    // Iniciar sesión con correo electrónico y contraseña
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    showMessage("Inicio de sesión exitoso", "success");  // Mostrar mensaje de éxito
    console.log('Usuario autenticado:', userCredentials.user);

    // Redirigir a index.html después del inicio de sesión exitoso
    window.location.href = './Home/home.html';  // Cambiar la URL para redirigir
  } catch (error) {
    if (error.code === "auth/wrong-password") {
      showMessage("Contraseña incorrecta", "error");
    } else if (error.code === "auth/user-not-found") {
      showMessage("El correo electrónico es inválido", "error");
    } else {
      showMessage("Algo salió mal. Inténtelo de nuevo.", "error");
    }
  }
});
