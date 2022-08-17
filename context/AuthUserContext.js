import { createContext, useContext, Context } from 'react'
import useFirebaseAuth from '../firebase/useFirebaseAuth';

const authUserContext = createContext({
  authUser: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logOut: async () => {},
  sendPasswordReset: async () => {},
  signInWithGoogle: async () => {}
});

export function AuthUserProvider({ children }) {
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}

export const useAuthUserContext = () => useContext(authUserContext);