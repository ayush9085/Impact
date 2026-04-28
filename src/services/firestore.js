import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── USERS ────────────────────────────────────────────

export async function getUser(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUser(userId, data) {
  await updateDoc(doc(db, 'users', userId), data);
}

export async function getVolunteers() {
  const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── TASKS ────────────────────────────────────────────

export async function createTask(data) {
  const taskData = {
    ...data,
    status: data.status || 'open',
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, 'tasks'), taskData);
  return { id: docRef.id, ...taskData };
}

export async function updateTask(taskId, data) {
  await updateDoc(doc(db, 'tasks', taskId), data);
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId));
}

export async function getTasks() {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTask(taskId) {
  const snap = await getDoc(doc(db, 'tasks', taskId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getTasksByStatus(status) {
  const q = query(collection(db, 'tasks'), where('status', '==', status));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── MATCHES ──────────────────────────────────────────

export async function saveMatches(taskId, matches) {
  const batch = writeBatch(db);

  for (const match of matches) {
    const matchRef = doc(collection(db, 'matches'));
    batch.set(matchRef, {
      taskId,
      volunteerId: match.volunteerId,
      volunteerName: match.volunteerName,
      score: match.score,
      explanation: match.explanation || '',
      status: 'pending', // pending, accepted, rejected
      createdAt: new Date().toISOString(),
    });
  }

  await batch.commit();
}

export async function getMatchesForTask(taskId) {
  const q = query(collection(db, 'matches'), where('taskId', '==', taskId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMatchesForVolunteer(volunteerId) {
  const q = query(
    collection(db, 'matches'),
    where('volunteerId', '==', volunteerId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateMatchStatus(matchId, status) {
  await updateDoc(doc(db, 'matches', matchId), { status });
}
