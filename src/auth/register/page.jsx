import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { auth, handleGoogleLogin } from "../../Firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Rediriger si utilisateur déjà connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      toast.success(`Bienvenue ${name}, votre compte a été créé !`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur :", error.message);

      // Gestion des erreurs spécifiques
      switch (error.code) {
        case "auth/email-already-in-use":
          toast.error("Un compte existe déjà avec cette adresse email");
          break;
        case "auth/invalid-email":
          toast.error("Adresse email invalide");
          break;
        case "auth/weak-password":
          toast.error("Le mot de passe doit contenir au moins 6 caractères");
          break;
        default:
          toast.error("Une erreur est survenue lors de la création du compte");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
  try {
    const result = await handleGoogleLogin();
    const user = result.user;
    toast.success(`Bienvenue ${user.displayName} !`);
    navigate("/dashboard");
  } catch (error) {
    console.error("Erreur Google :", error);

    const errorCode = error?.code;

    if (typeof errorCode === "string") {
      switch (errorCode) {
        case "auth/account-exists-with-different-credential":
          toast.error(
            "Un compte existe déjà avec cette adresse e-mail via une autre méthode de connexion."
          );
          break;
        case "auth/popup-closed-by-user":
          toast.error("La fenêtre de connexion a été fermée.");
          break;
        default:
          toast.error("Échec de la connexion avec Google.");
      }
    } else {
      toast.error("Une erreur inattendue est survenue.");
    }
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center px-4">
      <a
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 group"
      >
        <CheckCircle className="h-7 w-7 text-indigo-600 group-hover:text-indigo-700 transition" />
        <span className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition">
          TaskFlow
        </span>
      </a>

      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 mt-20">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">
            Rejoignez-nous et commencez à organiser vos tâches
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="exemple@mail.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-400 mt-1">Minimum 6 caractères</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 mt-2 rounded-md text-white font-medium transition ${
              loading
                ? "bg-indigo-500 opacity-80 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } flex items-center justify-center`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer un compte"
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-500">OU</span>
          </div>
        </div>

        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2 py-3 mb-6 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          <FcGoogle className="h-5 w-5" />
          <span>S’inscrire avec Google</span>
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <a
            href="/auth/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Se connecter
          </a>
        </p>

        <p className="text-[11px] text-center text-gray-400 mt-6">
          En vous inscrivant, vous acceptez nos conditions d’utilisation.
        </p>
      </div>
    </div>
  );
}
