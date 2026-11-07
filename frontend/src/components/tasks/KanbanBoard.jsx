import { useMemo, useState } from "react";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Icon from "../common/Icon";
import SearchInput from "../common/SearchInput";
import { Select } from "../common/Input";
import { TASK_PRIORITIES, TASK_STATUSES } from "../../utils/constants";
import TaskCard from "./TaskCard";

/**
 * Tableau Kanban réutilisable et filtrable.
 * Il ne fait aucun appel réseau : le parent fournit les tâches et les callbacks.
 */
export default function KanbanBoard({
  tasks = [],
  showProject = false,
  canManage = false,
  canCreate = false,
  onCreate,
  onOpen,
  onEdit,
  onDelete,
  onStatusChange,
  createLabel = "Nouvelle tâche",
  emptyTitle = "Aucune tâche",
  emptyDescription = "Créez votre première tâche pour démarrer le suivi.",
}) {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [project, setProject] = useState("all");
  const [dragOver, setDragOver] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const assignees = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (task.assigned_to_name) map.set(task.assigned_to_name, task.assigned_to_name);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "fr"));
  }, [tasks]);

  const projects = useMemo(() => {
    const map = new Map();
    tasks.forEach((task) => {
      if (task.project_title) map.set(task.project_title, task.project_title);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "fr"));
  }, [tasks]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (priority !== "all" && task.priority !== priority) return false;
      if (assignee !== "all" && (task.assigned_to_name || "") !== assignee) return false;
      if (project !== "all" && (task.project_title || "") !== project) return false;
      if (!query) return true;
      return (
        String(task.title || "").toLowerCase().includes(query) ||
        String(task.description || "").toLowerCase().includes(query)
      );
    });
  }, [tasks, search, priority, assignee, project]);

  const hasFilters = search || priority !== "all" || assignee !== "all" || project !== "all";

  function resetFilters() {
    setSearch("");
    setPriority("all");
    setAssignee("all");
    setProject("all");
  }

  function handleDrop(event, status) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    setDragOver(null);
    setDraggingId(null);
    if (!taskId) return;
    const task = tasks.find((item) => String(item.id) === taskId);
    if (!task || task.status === status) return;
    onStatusChange?.(task, status);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Rechercher une tâche…"
          className="min-w-[12rem] flex-1"
        />

        <Select
          aria-label="Filtrer par priorité"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="min-w-[9rem]"
          options={[{ value: "all", label: "Toutes priorités" }, ...TASK_PRIORITIES]}
        />

        <Select
          aria-label="Filtrer par membre"
          value={assignee}
          onChange={(event) => setAssignee(event.target.value)}
          className="min-w-[9rem]"
          options={[
            { value: "all", label: "Tous les membres" },
            ...assignees.map((name) => ({ value: name, label: name })),
          ]}
        />

        {showProject && projects.length > 0 && (
          <Select
            aria-label="Filtrer par projet"
            value={project}
            onChange={(event) => setProject(event.target.value)}
            className="min-w-[9rem]"
            options={[
              { value: "all", label: "Tous les projets" },
              ...projects.map((title) => ({ value: title, label: title })),
            ]}
          />
        )}

        {hasFilters && (
          <Button variant="ghost" size="sm" icon={<Icon name="close" className="h-4 w-4" />} onClick={resetFilters}>
            Réinitialiser
          </Button>
        )}

        {canCreate && (
          <Button
            size="sm"
            icon={<Icon name="plus" className="h-4 w-4" />}
            onClick={onCreate}
            className="ml-auto"
          >
            {createLabel}
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="kanban"
          title={emptyTitle}
          description={emptyDescription}
          action={
            canCreate ? (
              <Button icon={<Icon name="plus" className="h-4 w-4" />} onClick={onCreate}>
                {createLabel}
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((column) => {
            const columnTasks = filtered.filter((task) => task.status === column.value);
            const isOver = dragOver === column.value;

            return (
              <section
                key={column.value}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragOver(column.value);
                }}
                onDragLeave={() => setDragOver((current) => (current === column.value ? null : current))}
                onDrop={(event) => handleDrop(event, column.value)}
                className={`flex flex-col rounded-2xl border p-3 transition ${
                  isOver
                    ? "border-brand-400 bg-brand-50/60 dark:border-brand-500/60 dark:bg-brand-500/5"
                    : "border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/60"
                }`}
                aria-label={`Colonne ${column.label}`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                    {column.label}
                  </h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className={draggingId === task.id ? "opacity-50" : ""}
                    >
                      <TaskCard
                        task={task}
                        showProject={showProject}
                        canManage={canManage}
                        onOpen={onOpen}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDragStart={(item) => setDraggingId(item.id)}
                        onDragEnd={() => setDraggingId(null)}
                      />
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                      {hasFilters ? "Aucune tâche ne correspond aux filtres." : "Aucune tâche"}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
