import React, { useState, useEffect } from "react";
import { DashboardLayout } from "./DashboardLayout";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  PieChart,
  Calendar,
  FileText,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../Firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({
    todo: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
    overdue: 0,
  });
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  const COLORS = ["#FF6384", "#36A2EB", "#4BC0C0"];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchDashboardData(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (uid) => {
    try {
      setError(null);
      setLoading(true);
      
      // Récupérer les tâches (sans orderBy pour éviter l'erreur d'index)
      const tasksQuery = query(
        collection(db, "tasks"),
        where("userId", "==", uid)
      );
      const tasksSnapshot = await getDocs(tasksQuery);

      const tasks = [];
      const stats = {
        todo: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
        overdue: 0,
      };

      const now = new Date();
      
      // Calculer les statistiques et organiser les tâches
      tasksSnapshot.forEach((doc) => {
        const taskData = doc.data();
        const task = { 
          id: doc.id, 
          ...taskData,
          // Normaliser les dates
          createdAt: taskData.createdAt?.toDate?.() || new Date(taskData.createdAt || now),
          updatedAt: taskData.updatedAt?.toDate?.() || new Date(taskData.updatedAt || now),
          dueDate: taskData.dueDate ? (taskData.dueDate?.toDate?.() || new Date(taskData.dueDate)) : null
        };
        tasks.push(task);

        stats.total++;
        
        // Compter par statut
        switch (task.status) {
          case "todo":
            stats.todo++;
            break;
          case "in-progress":
            stats.inProgress++;
            break;
          case "completed":
            stats.completed++;
            break;
          default:
            stats.todo++;
        }

        // Vérifier si la tâche est en retard
        if (
          task.dueDate &&
          task.dueDate < now &&
          task.status !== "completed"
        ) {
          stats.overdue++;
        }
      });

      setTaskStats(stats);

      // Trier et récupérer les tâches récentes
      const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt;
        const dateB = b.updatedAt || b.createdAt;
        return dateB - dateA;
      });
      setRecentTasks(sortedTasks.slice(0, 5));

      // Générer les données d'activité hebdomadaire réelles
      generateRealWeeklyActivity(tasks);

      // Générer les données de productivité réelles
      generateRealProductivityData(tasks);
      
    } catch {
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour générer l'activité hebdomadaire basée sur les vraies données
  const generateRealWeeklyActivity = (tasks) => {
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weekData = new Array(7).fill(0);
    
    // Calculer le début de la semaine (dimanche)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Compter les tâches créées chaque jour de la semaine
    tasks.forEach(task => {
      const taskDate = task.createdAt;
      if (taskDate >= startOfWeek) {
        const dayOfWeek = taskDate.getDay();
        weekData[dayOfWeek]++;
      }
    });

    // Créer les données pour le graphique
    const activityData = days.map((day, index) => ({
      name: day,
      created: weekData[index],
      completed: tasks.filter(task => {
        if (task.status !== 'completed' || !task.updatedAt) return false;
        const completedDate = task.updatedAt;
        return completedDate >= startOfWeek && completedDate.getDay() === index;
      }).length
    }));

    setWeeklyActivity(activityData);
  };

  // Fonction pour générer les données de productivité basées sur les vraies données
  const generateRealProductivityData = (tasks) => {
    const productivityData = [];
    const now = new Date();
    
    // Générer les 7 dernières semaines
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Compter les tâches créées et terminées cette semaine
      const tasksCreated = tasks.filter(task => 
        task.createdAt >= weekStart && task.createdAt <= weekEnd
      ).length;
      
      const tasksCompleted = tasks.filter(task => 
        task.status === 'completed' && 
        task.updatedAt >= weekStart && 
        task.updatedAt <= weekEnd
      ).length;

      // Calculer l'efficacité (% de tâches terminées)
      const efficiency = tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;
      
      productivityData.push({
        name: `S${i === 0 ? '' : '-'}${i === 0 ? 'cette semaine' : i}`,
        created: tasksCreated,
        completed: tasksCompleted,
        efficiency: efficiency
      });
    }

    setProductivityData(productivityData);
  };

  // Fonction utilitaire pour formater les dates
  const formatDate = (date) => {
    if (!date) return "Date inconnue";
    
    try {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "Date invalide";
    }
  };

  // Fonction utilitaire pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Fonction utilitaire pour obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "in-progress":
        return "En cours";
      case "todo":
        return "À faire";
      default:
        return "À faire";
    }
  };

  // Fonction utilitaire pour obtenir la couleur de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Fonction utilitaire pour obtenir le libellé de priorité
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "Élevée";
      case "medium":
        return "Moyenne";
      case "low":
        return "Basse";
      default:
        return "Normale";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des données...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button 
            onClick={() => userId && fetchDashboardData(userId)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors dark:bg-red-700 dark:hover:bg-red-800"
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!userId) {
    return (
      <DashboardLayout>
        <div className="text-center p-8 bg-gray-50 rounded-lg dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Vous devez être connecté pour accéder au tableau de bord.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const taskDistribution = [
    { name: "À faire", value: taskStats.todo },
    { name: "En cours", value: taskStats.inProgress },
    { name: "Terminé", value: taskStats.completed },
  ].filter(item => item.value > 0); // Filtrer les valeurs nulles pour le graphique

  // Tooltip personnalisé pour l'activité hebdomadaire
  const WeeklyActivityTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="font-medium dark:text-gray-200">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="dark:text-gray-300" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value} tâche${entry.value > 1 ? 's' : ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Tooltip personnalisé pour la productivité
  const ProductivityTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="font-medium dark:text-gray-200">{`${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400">{`Créées: ${data.created}`}</p>
          <p className="text-green-600 dark:text-green-400">{`Terminées: ${data.completed}`}</p>
          <p className="text-purple-600 dark:text-purple-400">{`Efficacité: ${data.efficiency}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-2 md:p-2">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vue d'ensemble de votre productivité et de vos tâches
          </p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Carte Tâches totales */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tâches totales
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {taskStats.total}
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/50">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Carte Tâches en retard */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tâches en retard
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {taskStats.overdue}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Carte Tâches en cours */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En cours</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {taskStats.inProgress}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/50">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Carte Tâches terminées */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Terminées</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {taskStats.completed}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Activité hebdomadaire */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Activité hebdomadaire
              </h2>
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280' }} 
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280' }} 
                  />
                  <Tooltip content={<WeeklyActivityTooltip />} />
                  <Legend />
                  <Bar dataKey="created" fill="#8884d8" name="Tâches créées" />
                  <Bar dataKey="completed" fill="#82ca9d" name="Tâches terminées" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Répartition des tâches */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Répartition des tâches
              </h2>
              <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="h-64">
              {taskDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      }}
                      itemStyle={{ color: '#000' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p>Aucune tâche à afficher</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section inférieure */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Productivité */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Tendance de productivité (7 dernières semaines)
              </h2>
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280' }} 
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280' }} 
                  />
                  <Tooltip content={<ProductivityTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#8884d8"
                    name="Efficacité (%)"
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tâches récentes */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Tâches récentes
              </h2>
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start pb-4 border-b border-gray-200 last:border-0 last:pb-0 dark:border-gray-700"
                  >
                    <div
                      className={`flex items-center justify-center h-6 w-6 rounded-full mt-1 mr-3 ${
                        task.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/50"
                          : task.status === "in-progress"
                          ? "bg-blue-100 dark:bg-blue-900/50"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {task.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : task.status === "in-progress" ? (
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate dark:text-gray-100" title={task.title}>
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(task.createdAt)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 dark:text-gray-400">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p>Aucune tâche récente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;