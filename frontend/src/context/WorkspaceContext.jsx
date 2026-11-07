import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as memberService from "../services/memberService";
import { getErrorMessage } from "../utils/errors";
import { canManageTeam, isAdmin } from "../utils/roles";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

const STORAGE_KEY = "nyasako.workspace";

const DEFAULT_WORKSPACE = {
  name: "Espace NyAsako",
  description: "Notre espace de travail collaboratif.",
  defaultRole: "Développeur",
};

function readWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_WORKSPACE, ...JSON.parse(raw) } : DEFAULT_WORKSPACE;
  } catch {
    return DEFAULT_WORKSPACE;
  }
}

/**
 * Contexte de l'espace de travail : informations du workspace et membres.
 * Les préférences locales (nom, description) sont persistées dans le navigateur ;
 * la liste des membres provient de l'API.
 */
export function WorkspaceProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [workspace, setWorkspace] = useState(readWorkspace);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

  const refreshMembers = useCallback(async () => {
    if (!isAuthenticated) {
      setMembers([]);
      return;
    }
    setMembersLoading(true);
    setMembersError("");
    try {
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (err) {
      setMembers([]);
      setMembersError(getErrorMessage(err));
    } finally {
      setMembersLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const updateWorkspace = useCallback((patch) => {
    setWorkspace((previous) => {
      const next = { ...previous, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addMember = useCallback(
    async (payload) => {
      const member = await memberService.addMember(payload);
      await refreshMembers();
      return member;
    },
    [refreshMembers]
  );

  const updateMember = useCallback(
    async (id, payload) => {
      const member = await memberService.updateMember(id, payload);
      await refreshMembers();
      return member;
    },
    [refreshMembers]
  );

  const removeMember = useCallback(
    async (id) => {
      await memberService.removeMember(id);
      await refreshMembers();
    },
    [refreshMembers]
  );

  const value = useMemo(
    () => ({
      workspace,
      updateWorkspace,
      members,
      membersLoading,
      membersError,
      refreshMembers,
      addMember,
      updateMember,
      removeMember,
      memberCount: members.length,
      canManageTeam: canManageTeam(user),
      isAdmin: isAdmin(user),
    }),
    [
      workspace,
      updateWorkspace,
      members,
      membersLoading,
      membersError,
      refreshMembers,
      addMember,
      updateMember,
      removeMember,
      user,
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
