import { useState, useEffect } from 'react'
import { app } from './firebase2';

import {
    getAuth,
    signOut,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    GoogleAuthProvider,
  } from "firebase/auth";

import {
    getFirestore,
    query,
    getDocs,
    collection,
    where,
    addDoc,
  } from "firebase/firestore";

import { getStorage } from "firebase/storage";

import { useRouter } from 'next/router';

const formatAuthUser = (user) => ({
  uid: user.uid,
  email: user.email
});

export default function useFirebaseAuth() {

    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();

    const auth = getAuth(app)
    const db = getFirestore(app);
    const storage = getStorage(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    const authStateChanged = async (authState) => {
        if (!authState) {
          setLoading(false)
          return;
        }
        setLoading(true)
        var formattedUser = formatAuthUser(authState);
        setAuthUser(formattedUser);
        setLoading(false);
      };

    const clear = () => {
        setAuthUser(null);
        setLoading(false);
      };


    const signInWithGoogle = () => 
    signInWithPopup(auth, googleProvider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
          addDoc(collection(db, "users"), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
          });
      }
        // redux action? --> dispatch({ type: SET_USER, user });
        router.push('/dashboard');
    })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
    

    const signIn = (email, password) => {
        try {
            signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
        };
        

    const signUp = (firstName, lastName, email, password) =>
    createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in 
      const user = userCredential.user;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        addDoc(collection(db, "users"), {
        uid: user.uid,
        name: `${firstName} ${lastName}`,
        authProvider: "manual",
        email: user.email,
        });
      }
      router.push('/dashboard');      
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });

    // const signUp = async (name, email, password) => {
    //     try {
    //         const res = createUserWithEmailAndPassword(auth, email, password);
    //         const user = res.user;
    //         const q = query(collection(db, "users"), where("uid", "==", user.uid));
    //         const docs = await getDocs(q);
    //         if (docs.docs.length === 0) {
    //           addDoc(collection(db, "users"), {
    //           uid: user.uid,
    //           name: name,
    //           authProvider: "google",
    //           email: user.email,
    //           });
    //         }
    //         router.push('/dashboard');
    //     } catch (err) {
    //         console.error(err);
    //         alert(err.message);
    //     }
    //     };

    const logOut = () =>
        signOut(auth).then(clear)
        
    const sendPasswordReset = (email) => {
        try {
            sendPasswordResetEmail(auth, email);
            alert("Password reset link sent! Please check SPAM folder if you do not see it in your inbox.");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
        };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, authStateChanged);
        return unsubscribe
      }, []);


  return {
    authUser,
    loading,
    storage,
    signIn,
    signUp,
    logOut,
    sendPasswordReset,
    signInWithGoogle
  };
}