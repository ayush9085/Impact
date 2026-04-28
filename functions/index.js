const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Triggered when a new task is created — automatically runs matching.
 */
exports.onTaskCreated = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = { id: context.params.taskId, ...snap.data() };

    try {
      const volunteersSnap = await db.collection('users')
        .where('role', '==', 'volunteer')
        .get();

      const volunteers = volunteersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const matches = findTopMatches(volunteers, task, 3);

      const batch = db.batch();
      matches.forEach(match => {
        const ref = db.collection('matches').doc();
        batch.set(ref, {
          taskId: task.id,
          volunteerId: match.volunteerId,
          volunteerName: match.volunteerName,
          score: match.score,
          breakdown: match.breakdown,
          explanation: match.explanation,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      });
      await batch.commit();

      // Update task status
      await snap.ref.update({ status: 'matched' });
      console.log(`Matched ${matches.length} volunteers to task ${task.id}`);
    } catch (err) {
      console.error('Matching failed:', err);
    }
  });

/**
 * HTTP callable: manually trigger matching for a task.
 */
exports.matchVolunteers = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { taskId } = data;
  const taskSnap = await db.collection('tasks').doc(taskId).get();
  if (!taskSnap.exists) throw new functions.https.HttpsError('not-found', 'Task not found');

  const task = { id: taskId, ...taskSnap.data() };
  const volunteersSnap = await db.collection('users').where('role', '==', 'volunteer').get();
  const volunteers = volunteersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const matches = findTopMatches(volunteers, task, 3);

  const batch = db.batch();
  matches.forEach(match => {
    const ref = db.collection('matches').doc();
    batch.set(ref, {
      taskId, volunteerId: match.volunteerId, volunteerName: match.volunteerName,
      score: match.score, breakdown: match.breakdown, explanation: match.explanation,
      status: 'pending', createdAt: new Date().toISOString(),
    });
  });
  await batch.commit();
  await db.collection('tasks').doc(taskId).update({ status: 'matched' });

  return { matches: matches.length };
});

// ── MATCHING ALGORITHM (same logic as client) ──

function calcSkillMatch(vSkills, rSkills) {
  if (!rSkills || rSkills.length === 0) return 1;
  if (!vSkills || vSkills.length === 0) return 0;
  const vSet = new Set(vSkills.map(s => s.toLowerCase()));
  const rSet = new Set(rSkills.map(s => s.toLowerCase()));
  const intersection = [...rSet].filter(s => vSet.has(s)).length;
  const union = new Set([...vSet, ...rSet]).size;
  return union > 0 ? intersection / union : 0;
}

function findTopMatches(volunteers, task, topN = 3) {
  const urgencyBoost = { high: 1.0, medium: 0.5, low: 0.0 };
  const scored = volunteers.map(v => {
    const skill = calcSkillMatch(v.skills, task.requiredSkills);
    const location = (v.location || '').toLowerCase() === (task.location || '').toLowerCase() ? 1 : 0;
    const avail = v.availability ? 1 : 0;
    const urgency = urgencyBoost[task.urgency] || 0;
    const total = Math.round((skill * 0.5 + location * 0.2 + avail * 0.2 + urgency * 0.1) * 100);
    return {
      volunteerId: v.id, volunteerName: v.name, score: total,
      breakdown: {
        skill: Math.round(skill * 100), location: Math.round(location * 100),
        availability: Math.round(avail * 100), urgency: Math.round(urgency * 100),
      },
      explanation: `${v.name} matches with a score of ${total}% based on skills, location, and availability.`,
    };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
