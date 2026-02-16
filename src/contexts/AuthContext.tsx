import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, User as ApiUser } from "@/lib/auth.service";
import { useToast } from "@/hooks/use-toast";

interface User extends ApiUser {
  points?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthData: (user: User, token: string) => void;
  isLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved session
    const savedToken = localStorage.getItem("jallai_token");
    const savedUser = localStorage.getItem("jallai_user");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Optionally validate token by fetching profile
      authService.getProfile(savedToken)
        .then((profile) => {
          setUser({ ...profile, points: 0 });
          localStorage.setItem("jallai_user", JSON.stringify(profile));
        })
        .catch(() => {
          // Token is invalid, clear session
          localStorage.removeItem("jallai_token");
          localStorage.removeItem("jallai_user");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.signIn({ email, password });
      
      // Only proceed if we have user and access data (not OTP flow)
      if (response.user && response.access) {
        setUser({ ...response.user, points: 0 });
        setToken(response.access.accessToken);
        
        localStorage.setItem("jallai_token", response.access.accessToken);
        localStorage.setItem("jallai_user", JSON.stringify(response.user));
        localStorage.setItem("token", response.access.accessToken); // For services
        
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${response.user.name || response.user.email}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("jallai_token");
      localStorage.removeItem("jallai_user");
      localStorage.removeItem("token");
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    }
  };

  const setAuthData = (userData: User, authToken: string) => {
    setUser({ ...userData, points: 0 });
    setToken(authToken);
    
    localStorage.setItem("jallai_token", authToken);
    localStorage.setItem("jallai_user", JSON.stringify(userData));
    localStorage.setItem("token", authToken); // For services
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setAuthData, isLoggedIn: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

