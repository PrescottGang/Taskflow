import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { auth } from '../../Firebase'; // Importez votre configuration Firebase
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  if (!email.trim()) {
    toast.error("Veuillez entrer une adresse email.");
    setIsLoading(false);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
    toast.success(`Un lien de réinitialisation a été envoyé à ${email.trim()}`);
    setEmail('');
  } catch (err) {
    console.error("Erreur Firebase :", err);
    const errorCode = err?.code || '';

    switch (errorCode) {
      case 'auth/invalid-email':
        toast.error("Adresse email invalide.");
        break;
      case 'auth/user-not-found':
        toast.error("Aucun utilisateur trouvé avec cette adresse email.");
        break;
      default:
        toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
  } finally {
    setIsLoading(false);
  }
};



    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <FaLock className="text-indigo-600 text-5xl" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Mot de passe oublié ?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Adresse email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="py-3 pl-10 block w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Envoi en cours...
                                    </span>
                                ) : 'Envoyer le lien'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-500"
                        >
                            <FaArrowLeft className="mr-2" />
                            Retour à la page de connexion
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                    Vous n'avez pas reçu d'email ? Vérifiez votre dossier spam ou{' '}
                    <button 
                        onClick={handleSubmit}
                        disabled={!email || isLoading}
                        className={`font-medium text-indigo-600 hover:text-indigo-500 ${(!email || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        renvoyer le lien
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;