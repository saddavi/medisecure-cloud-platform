// MediSecure Cloud Platform - Authentication Context
// Healthcare-grade authentication with AWS Cognito integration

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { amplifyAuthService } from "@/services/amplifyAuth";
import {
  AuthState,
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthTokens,
} from "@/types";
import toast from "react-hot-toast";

// ============= Auth Actions =============
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: AuthUser; tokens: AuthTokens } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "CLEAR_ERROR" };

// ============= Initial State =============
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tokens: null,
  error: null,
};

// ============= Auth Reducer =============
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };

    case "AUTH_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
        error: action.payload,
      };

    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// ============= Context Type =============
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

// ============= Create Context =============
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============= Auth Provider =============
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ============= Auth Methods =============

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });

      console.log("🔐 Starting login process with AWS Cognito...");

      // Use Amplify authentication service
      const response = await amplifyAuthService.login(credentials);

      if (response.success && response.user && response.tokens) {
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: response.user, tokens: response.tokens },
        });
        toast.success("Login successful! Welcome to MediSecure.");
        console.log("✅ Login successful with Cognito");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      dispatch({ type: "AUTH_START" });

      console.log("📝 Starting registration process with AWS Cognito...");

      // Use Amplify authentication service
      const response = await amplifyAuthService.register(data);

      if (response.success) {
        dispatch({ type: "SET_LOADING", payload: false });
        toast.success(
          response.message ||
            "Registration successful! Please check your email for verification."
        );
        console.log("✅ Registration successful with Cognito");
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("🚪 Logging out with AWS Cognito...");

      // Use Amplify authentication service
      await amplifyAuthService.logout();

      dispatch({ type: "LOGOUT" });
      toast.success("Logged out successfully");
      console.log("✅ Logout successful with Cognito");
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      // Still dispatch logout even if there's an error
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      console.log("🔄 Checking authentication status with AWS Cognito...");

      // Check if user is authenticated with Amplify
      const isAuthenticated = await amplifyAuthService.isAuthenticated();

      if (isAuthenticated) {
        const user = await amplifyAuthService.getCurrentUser();
        const tokens = await amplifyAuthService.getTokens();

        if (user && tokens) {
          dispatch({
            type: "AUTH_SUCCESS",
            payload: { user, tokens },
          });
          console.log("✅ User is authenticated with Cognito");
          return;
        }
      }

      // No valid authentication found
      console.log("ℹ️ No valid authentication found");
      dispatch({ type: "LOGOUT" });
    } catch (error: any) {
      console.error("❌ Auth refresh failed:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  // ============= Initialize Auth =============
  useEffect(() => {
    refreshAuth();
  }, []);

  // ============= Context Value =============
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============= Custom Hook =============
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
