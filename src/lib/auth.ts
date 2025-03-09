import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Create a new user with email and password
export async function signUp(
  email: string,
  password: string,
  fullName: string,
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update profile with full name
    await updateProfile(user, {
      displayName: fullName,
    });

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      name: fullName,
      full_name: fullName,
      email: email,
      user_id: user.uid,
      created_at: serverTimestamp(),
    });

    return { user };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { user: userCredential.user };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: user.displayName,
        full_name: user.displayName,
        email: user.email,
        user_id: user.uid,
        created_at: serverTimestamp(),
      });
    }

    return { user };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Sign out
export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Reset password
export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Update password
export async function updateUserPassword(password: string) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is signed in");

    await updatePassword(user, password);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
