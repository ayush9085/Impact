import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Sign up a new user with email/password and create their Firestore profile.
 */
export async function signUp(email, password, name, role, extraData = {}) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  const userData = {
    id: user.uid,
    name,
    email,
    role, // 'ngo_admin' or 'volunteer'
    skills: extraData.skills || [],
    location: extraData.location || '',
    availability: extraData.availability ?? true,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return { user, userData };
}

/**
 * Log in an existing user with email/password.
 */
export async function logIn(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Log out the current user.
 */
export async function logOut() {
  await signOut(auth);
}
