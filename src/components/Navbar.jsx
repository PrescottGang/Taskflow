import React from "react";
import { CheckCircle, Tag, Clock, Users, Bell, ChevronRight } from "lucide-react";
import   Logo  from "../assets/dashboard.png";

const Navbar = () => {
  const navLinks = [
    { name: "Accueil", href: "#" },
    { name: "Fonctionnalités", href: "#" },
    { name: "Tarifs", href: "#" },
  ];

  const features = [
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Gestion des tâches",
      description:
        "Créez, modifiez et organisez vos tâches avec un système complet et intuitif.",
    },
    {
      icon: <Tag className="h-6 w-6" />,
      title: "Catégorisation",
      description:
        "Organisez vos tâches avec des tags et priorités personnalisables.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaboration",
      description: "Travaillez en équipe et partagez facilement vos tâches.",
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Notifications",
      description: "Recevez des rappels pour ne jamais manquer une échéance.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hors-ligne",
      description: "Fonctionne même sans connexion internet grâce au mode PWA.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      title: "Statistiques",
      description:
        "Visualisez votre progression avec des graphiques détaillés.",
    },
  ];

  return (
    <div className="font-sans antialiased text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2 group">
            <CheckCircle className="h-7 w-7 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
            <span className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
              TaskFlow
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex gap-6 items-center text-sm font-medium text-gray-700">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/auth/login">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">
                Connexion
              </button>
            </a>
            <a href="/auth/register">
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-shadow shadow-sm hover:shadow-md">
                S'inscrire
              </button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="py-16 md:py-28 lg:py-36 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                  Gérez vos tâches avec{" "}
                  <span className="text-indigo-600">simplicité</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  TaskFlow révolutionne votre productivité avec une interface intuitive
                  et des fonctionnalités puissantes pour organiser, prioriser et suivre
                  vos tâches quotidiennes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <a href="/auth/register">
                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow hover:shadow-md transition-all">
                      Commencer gratuitement
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </a>
                  <a href="/features">
                    <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 hover:border-indigo-300 text-gray-700 hover:text-indigo-600 font-medium rounded-lg bg-white hover:bg-gray-50 transition-all">
                      Voir les fonctionnalités
                    </button>
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-100 rounded-2xl transform rotate-1"></div>
                <img
                  src={Logo}
                  alt="TaskFlow Dashboard Preview"
                  className="relative rounded-xl border border-gray-200 shadow-lg w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Boostez votre productivité
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Découvrez les fonctionnalités qui font de TaskFlow l'outil ultime de gestion des tâches
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white hover:bg-indigo-50 rounded-xl p-6 border border-gray-100 hover:shadow transition-all duration-300"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">TaskFlow</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0 text-sm">
              <a href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">
                À propos
              </a>
              <a href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Confidentialité
              </a>
              <a href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Conditions
              </a>
              <a href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Contact
              </a>
            </div>
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} TaskFlow. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Navbar;
