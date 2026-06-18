import React, { useEffect, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { auth, handleGoogleLogin } from "../../Firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur de connexion :", error.message);
      
      // Gestion des erreurs spécifiques
      let errorMessage = "Erreur de connexion";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Aucun compte trouvé avec cet email";
          break;
        case "auth/wrong-password":
          errorMessage = "Mot de passe incorrect";
          break;
        case "auth/invalid-email":
          errorMessage = "Format d'email invalide";
          break;
        case "auth/user-disabled":
          errorMessage = "Ce compte a été désactivé";
          break;
        case "auth/too-many-requests":
          errorMessage = "Trop de tentatives. Réessayez plus tard";
          break;
        default:
          errorMessage = "Erreur de connexion. Vérifiez vos identifiants";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await handleGoogleLogin();
      const user = result.user;
      toast.success(`Bienvenue ${user.displayName || user.email} !`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur Google :", error.message);
      toast.error(error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Logo en haut à gauche */}
      <a
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 group"
      >
        <CheckCircle className="h-7 w-7 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
        <span className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
          TaskFlow
        </span>
      </a>

      {/* Carte de connexion */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* En-tête */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h1>
            <p className="text-gray-600">
              Entrez vos identifiants pour accéder à votre compte
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500 hover:underline"
                >
                  Mot de passe oublié?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center transition-colors ${
                (loading || googleLoading) ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>

            {/* Séparateur */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500">OU</span>
              </div>
            </div>

            {/* Google login */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 mb-6 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 transition ${
                (loading || googleLoading) ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <FcGoogle className="h-5 w-5" />
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            {/* Lien vers l'inscription */}
            <div className="text-center text-sm text-gray-600">
              Vous n'avez pas de compte?{" "}
              <a
                href="/auth/register"
                className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline"
              >
                S'inscrire
              </a>
            </div>
          </form>
        </div>

        {/* Pied de page optionnel */}
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-500">
          En vous connectant, vous acceptez nos conditions d'utilisation.
        </div>
      </div>
    </div>
  );
}