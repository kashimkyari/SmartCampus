import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, User, Institution } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  institution: Institution | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setInstitution: (institution: Institution) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [institution, setInstitutionState] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authApi.getToken();
        if (token) {
          const data = await authApi.getCurrentUser();
          setUser(data.user);
          setInstitutionState(data.institution || null);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        authApi.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login({ email, password });
      setUser(data.user);
      setInstitutionState(data.institution || null);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const data = await authApi.register({ username, email, password });
      setUser(data.user);
      setInstitutionState(data.institution || null);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setInstitutionState(null);
  };

  const setInstitution = (institution: Institution) => {
    setInstitutionState(institution);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        institution,
        isLoading,
        login,
        register,
        logout,
        setInstitution,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}