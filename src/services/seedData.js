import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

const DEMO_VOLUNTEERS = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@demo.com',
    role: 'volunteer',
    skills: ['teaching', 'first-aid', 'counseling'],
    location: 'Mumbai',
    availability: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@demo.com',
    role: 'volunteer',
    skills: ['construction', 'driving', 'logistics'],
    location: 'Delhi',
    availability: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Anita Desai',
    email: 'anita.desai@demo.com',
    role: 'volunteer',
    skills: ['medical', 'nursing', 'first-aid'],
    location: 'Mumbai',
    availability: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Karan Singh',
    email: 'karan.singh@demo.com',
    role: 'volunteer',
    skills: ['tech', 'data-entry', 'communication'],
    location: 'Bangalore',
    availability: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Meera Patel',
    email: 'meera.patel@demo.com',
    role: 'volunteer',
    skills: ['cooking', 'event-planning', 'teaching'],
    location: 'Delhi',
    availability: true,
    createdAt: new Date().toISOString(),
  },
];

const DEMO_TASKS = [
  {
    title: 'Flood Relief Coordination',
    description:
      'Coordinate relief efforts for communities affected by recent flooding in the western suburbs. Need volunteers to help with supply distribution, first-aid stations, and transportation of essential goods to affected areas.',
    location: 'Mumbai',
    urgency: 'high',
    requiredSkills: ['logistics', 'driving', 'first-aid'],
    status: 'open',
    createdAt: new Date().toISOString(),
  },
  {
    title: 'Community Health Camp',
    description:
      'Organize a free health checkup camp for underserved communities. Requires medical professionals for basic screenings, counseling services, and health awareness sessions.',
    location: 'Mumbai',
    urgency: 'medium',
    requiredSkills: ['medical', 'nursing', 'counseling'],
    status: 'open',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    title: 'Digital Literacy Workshop',
    description:
      'Conduct a week-long digital literacy program for senior citizens and underprivileged youth. Topics include basic computer skills, internet safety, and using government digital services.',
    location: 'Bangalore',
    urgency: 'low',
    requiredSkills: ['tech', 'teaching', 'communication'],
    status: 'open',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    title: 'Food Distribution Drive',
    description:
      'Large-scale food distribution drive for daily-wage workers and homeless populations. Need volunteers for cooking, packing, and distributing meals across 10 distribution points.',
    location: 'Delhi',
    urgency: 'high',
    requiredSkills: ['cooking', 'logistics', 'driving'],
    status: 'open',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    title: 'School Renovation Project',
    description:
      'Renovate a government school building including painting, minor repairs, setting up a computer lab, and organizing an inauguration event for the community.',
    location: 'Delhi',
    urgency: 'medium',
    requiredSkills: ['construction', 'event-planning'],
    status: 'open',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

/**
 * Seed demo data into Firestore.
 * Only writes if the collections are empty.
 */
export async function seedDemoData() {
  const results = { volunteers: 0, tasks: 0 };

  // Check if volunteers (demo) already exist
  const usersSnap = await getDocs(collection(db, 'users'));
  const existingVolunteers = usersSnap.docs.filter(
    (d) => d.data().role === 'volunteer'
  );

  if (existingVolunteers.length === 0) {
    const batch = writeBatch(db);
    DEMO_VOLUNTEERS.forEach((vol) => {
      const ref = doc(collection(db, 'users'));
      batch.set(ref, { ...vol, id: ref.id });
    });
    await batch.commit();
    results.volunteers = DEMO_VOLUNTEERS.length;
  }

  // Check if tasks already exist
  const tasksSnap = await getDocs(collection(db, 'tasks'));
  if (tasksSnap.empty) {
    const batch = writeBatch(db);
    DEMO_TASKS.forEach((task) => {
      const ref = doc(collection(db, 'tasks'));
      batch.set(ref, { ...task, id: ref.id });
    });
    await batch.commit();
    results.tasks = DEMO_TASKS.length;
  }

  return results;
}
