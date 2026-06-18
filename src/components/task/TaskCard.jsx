import {
  Calendar,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
} from "lucide-react";

export function TaskCard({ task, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date invalide";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const isOverdue = () => {
    if (task.status === "completed") return false;
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm hover:shadow transition-shadow border-gray-300 dark:border-gray-700">
      {/* Card Content */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-2 h-2 rounded-full ${getPriorityColor()}`}
              ></div>
              <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                {task.title || "Titre non défini"}
              </h3>
              {task.status === "completed" && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
              {task.description || "Aucune description"}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="h-3 w-3" />
              <span
                className={
                  isOverdue()
                    ? "text-red-600 dark:text-red-500 font-medium"
                    : ""
                }
              >
                {task.dueDate ? formatDate(task.dueDate) : "Pas de date"}
                {isOverdue() && (
                  <span className="ml-1 inline-flex items-center">
                    <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-500" />
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const dropdown = e.currentTarget.nextElementSibling;
                dropdown.classList.toggle("hidden");
              }}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="sr-only">Menu</span>
            </button>

            <div className="hidden absolute right-0 top-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.currentTarget.parentElement.classList.add("hidden");
                    onEdit();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center text-gray-900 dark:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.currentTarget.parentElement.classList.add("hidden");
                    onDelete();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer - Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="p-3 pt-0 flex flex-wrap gap-1 border-t border-gray-200 dark:border-gray-700">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-black dark:text-white text-sm rounded-full"
            >
              <Tag className="mr-1 h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
