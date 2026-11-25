import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as workspaceApi from "../services/workspaceService";
import { useAuth } from "./AuthContext";
import { WORKSPACE_STORAGE_KEY } from "../utils/constants";
import { getErrorMessage } from "../utils/errors";

const WorkspaceContext = createContext(null);

const FALLBACK_WORKSPACE = {
  id: null,
  name: "Espace personnel",
  role: "member",
};

function roleOf(workspace) {
  return (
    workspace?.my_role ||
    workspace?.role ||
    workspace?.member_role ||
    workspace?.pivot?.role ||
    "member"
  );
}

function readActiveId() {
  try {
    return localStorage.getItem(WORKSPACE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function persistActiveId(workspaceId) {
  try {
    if (workspaceId) localStorage.setItem(WORKSPACE_STORAGE_KEY, String(workspaceId));
    else localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch {
    return;
  }
}

export function WorkspaceProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;
  const [workspaces, setWorkspaces] = useState([]);
  const [activeId, setActiveId] = useState(readActiveId);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  const workspace = useMemo(() => {
    if (workspaces.length === 0) return FALLBACK_WORKSPACE;
    return workspaces.find((item) => String(item.id) === String(activeId)) || workspaces[0];
  }, [workspaces, activeId]);

  const workspaceId = workspace?.id ?? null;
  const currentRole = roleOf(workspace);

  const refreshWorkspaces = useCallback(async () => {
    if (!isAuthenticated || !userId) {
      setWorkspaces([]);
      setMembers([]);
      setActiveId("");
      persistActiveId("");
      return [];
    }

    setLoading(true);
    setError("");
    try {
      const list = await workspaceApi.getWorkspaces();
      setWorkspaces(list);

      const savedId = readActiveId();
      const selected = list.find((item) => String(item.id) === String(savedId)) || list[0];
      const nextId = selected ? String(selected.id) : "";
      setActiveId(nextId);
      persistActiveId(nextId);
      return list;
    } catch (err) {
      setWorkspaces([]);
      setError(getErrorMessage(err));
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId]);

  const refreshMembers = useCallback(
    async (targetId = workspaceId) => {
      if (!isAuthenticated || !targetId) {
        setMembers([]);
        return [];
      }

      setMembersLoading(true);
      setMembersError("");
      try {
        const list = await workspaceApi.getWorkspaceMembers(targetId);
        setMembers(list);
        return list;
      } catch (err) {
        setMembers([]);
        setMembersError(getErrorMessage(err));
        return [];
      } finally {
        setMembersLoading(false);
      }
    },
    [isAuthenticated, workspaceId]
  );

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const switchWorkspace = useCallback((targetId) => {
    setActiveId(String(targetId));
    persistActiveId(targetId);
  }, []);

  const addWorkspace = useCallback(
    async (payload) => {
      const created = await workspaceApi.createWorkspace(payload);
      await refreshWorkspaces();
      if (created?.id) switchWorkspace(created.id);
      return created;
    },
    [refreshWorkspaces, switchWorkspace]
  );

  const updateCurrentWorkspace = useCallback(
    async (payload) => {
      if (!workspaceId) return null;
      const updated = await workspaceApi.updateWorkspace(workspaceId, payload);
      await refreshWorkspaces();
      return updated;
    },
    [refreshWorkspaces, workspaceId]
  );

  const removeWorkspace = useCallback(
    async (targetId) => {
      await workspaceApi.deleteWorkspace(targetId);
      if (String(targetId) === String(workspaceId)) persistActiveId("");
      await refreshWorkspaces();
    },
    [refreshWorkspaces, workspaceId]
  );

  const leaveCurrentWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    await workspaceApi.leaveWorkspace(workspaceId);
    persistActiveId("");
    await refreshWorkspaces();
  }, [refreshWorkspaces, workspaceId]);

  const addMember = useCallback(
    async (payload) => {
      if (!workspaceId) return null;
      const member = await workspaceApi.addWorkspaceMember(workspaceId, payload);
      await refreshMembers();
      return member;
    },
    [refreshMembers, workspaceId]
  );

  const updateMember = useCallback(
    async (targetUserId, payload) => {
      if (!workspaceId) return null;
      const member = await workspaceApi.updateWorkspaceMember(workspaceId, targetUserId, payload);
      await refreshMembers();
      return member;
    },
    [refreshMembers, workspaceId]
  );

  const removeMember = useCallback(
    async (targetUserId) => {
      if (!workspaceId) return;
      await workspaceApi.removeWorkspaceMember(workspaceId, targetUserId);
      await refreshMembers();
    },
    [refreshMembers, workspaceId]
  );

  const value = useMemo(
    () => ({
      workspace,
      workspaces,
      workspaceId,
      activeWorkspaceId: workspaceId,
      currentRole,
      canManageMembers: ["owner", "admin", "manager"].includes(currentRole),
      canEditWorkspace: ["owner", "admin"].includes(currentRole),
      canDeleteWorkspace: currentRole === "owner",
      isOwner: currentRole === "owner",
      loading,
      error,
      members,
      membersLoading,
      membersError,
      memberCount: members.length,
      refreshWorkspaces,
      refreshMembers,
      switchWorkspace,
      addWorkspace,
      updateCurrentWorkspace,
      removeWorkspace,
      leaveCurrentWorkspace,
      addMember,
      updateMember,
      removeMember,
    }),
    [
      workspace,
      workspaces,
      workspaceId,
      currentRole,
      loading,
      error,
      members,
      membersLoading,
      membersError,
      refreshWorkspaces,
      refreshMembers,
      switchWorkspace,
      addWorkspace,
      updateCurrentWorkspace,
      removeWorkspace,
      leaveCurrentWorkspace,
      addMember,
      updateMember,
      removeMember,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace doit être utilisé dans un <WorkspaceProvider>.");
  }
  return context;
}
