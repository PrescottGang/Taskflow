import { useState, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { toast } from "react-toastify";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../Firebase";

export function TaskBoard({ searchQuery, filterStatus, userId }) {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const tasksData = [];
        querySnapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() });
        });

        tasksData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur lors de la récupération des tâches:", error);
        setError("Impossible de charger les tâches");
        setLoading(false);
        toast.error("Erreur lors du chargement des tâches");
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const todoTasks = filteredTasks.filter((task) => task.status === "todo");
  const inProgressTasks = filteredTasks.filter((task) => task.status === "in-progress");
  const completedTasks = filteredTasks.filter((task) => task.status === "completed");

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOver(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, columnId) => {
    e.preventDefault();
    setDraggedOver(columnId);
  };

  const handleDragLeave = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOver(null);
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDraggedOver(null);

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    const newTasks = tasks.map((t) =>
      t.id === draggedTask.id ? { ...t, status: newStatus } : t
    );
    setTasks(newTasks);

    try {
      const taskRef = doc(db, "tasks", draggedTask.id);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      const statusNames = {
        todo: "À faire",
        "in-progress": "En cours",
        completed: "Terminé",
      };

      toast.success(`"${draggedTask.title}" a été déplacée vers ${statusNames[newStatus]}`);
    } catch (error) {
      console.error("Erreur lors du déplacement de la tâche:", error);
      setTasks(tasks);
      toast.error("Erreur lors du déplacement de la tâche");
    }

    setDraggedTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${taskToDelete.title}" ?`)) return;

    try {
      setTasks(tasks.filter((t) => t.id !== taskId));
      await deleteDoc(doc(db, "tasks", taskId));
      toast.success(`"${taskToDelete.title}" a été supprimée`);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setTasks(tasks);
      toast.error("Erreur lors de la suppression de la tâche");
    }
  };

  const handleSaveTask = () => {
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const columns = [
    {
      id: "todo",
      title: "À faire",
      tasks: todoTasks,
      color: "text-yellow-600 dark:text-yellow-400",
      dotColor: "bg-yellow-500",
    },
    {
      id: "in-progress",
      title: "En cours",
      tasks: inProgressTasks,
      color: "text-blue-600 dark:text-blue-400",
      dotColor: "bg-blue-500",
    },
    {
      id: "completed",
      title: "Terminé",
      tasks: completedTasks,
      color: "text-green-600 dark:text-green-400",
      dotColor: "bg-green-500",
    },
  ];

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex gap-6 pt-6 h-full overflow-x-auto">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`
              flex-1 min-w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
              transition-all duration-200
              ${draggedOver === column.id ? "bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-400 shadow-lg" : ""}
            `}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.dotColor}`}></div>
                  <h2 className={`font-medium ${column.color} text-xl`}>
                    {column.title}
                  </h2>
                  <span
                    className={`text-sm ${column.color} bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xl`}
                  >
                    {column.tasks.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3 min-h-96 bg-gray-100 dark:bg-gray-700">
              {column.tasks.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-300">
                  <div className="text-center">
                    <p className="text-sm">
                      {column.id === "completed" ? "Aucune tâche terminée" : "Aucune tâche"}
                    </p>
                    {draggedOver === column.id && (
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                        Relâchez pour déplacer la tâche ici
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                column.tasks.map((task) => {
                  if (!task || !task.id) return null;

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`
                        cursor-move transition-all duration-200 select-none
                        ${draggedTask?.id === task.id ? "opacity-50 scale-95" : ""}
                        hover:scale-[1.02] hover:shadow-md
                      `}
                    >
                      <TaskCard
                        task={task}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                      />
                    </div>
                  );
                })
              )}

              {draggedOver === column.id && column.tasks.length > 0 && (
                <div className="border-2 border-dashed border-blue-300 bg-blue-50 dark:bg-blue-900 rounded-lg p-4 text-center text-blue-600 dark:text-blue-300 text-sm">
                  Relâchez pour déplacer la tâche ici
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
        userId={userId}
      />
    </div>
  );
}
