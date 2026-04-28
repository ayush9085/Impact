/**
 * Smart Volunteer-Task Matching Engine
 *
 * Score = Skill Match (50%) + Location Match (20%) + Availability (20%) + Urgency Boost (10%)
 */

/**
 * Calculate skill match score using Jaccard similarity.
 * Returns a value between 0 and 1.
 */
function calcSkillMatch(volunteerSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 1;
  if (!volunteerSkills || volunteerSkills.length === 0) return 0;

  const vSet = new Set(volunteerSkills.map((s) => s.toLowerCase().trim()));
  const rSet = new Set(requiredSkills.map((s) => s.toLowerCase().trim()));

  const intersection = [...rSet].filter((s) => vSet.has(s)).length;
  const union = new Set([...vSet, ...rSet]).size;

  return union > 0 ? intersection / union : 0;
}

/**
 * Calculate location match score.
 * Exact city match = 1.0, different city = 0.0.
 * Can be enhanced with Google Maps Distance API later.
 */
function calcLocationMatch(volunteerLocation, taskLocation) {
  if (!taskLocation || !volunteerLocation) return 0.5; // neutral if unknown
  return volunteerLocation.toLowerCase().trim() === taskLocation.toLowerCase().trim()
    ? 1.0
    : 0.0;
}

/**
 * Calculate availability score.
 */
function calcAvailabilityScore(isAvailable) {
  return isAvailable ? 1.0 : 0.0;
}

/**
 * Calculate urgency boost.
 */
function calcUrgencyBoost(urgency) {
  switch (urgency?.toLowerCase()) {
    case 'high':
      return 1.0;
    case 'medium':
      return 0.5;
    case 'low':
      return 0.0;
    default:
      return 0.0;
  }
}

/**
 * Calculate overall match score for a volunteer-task pair.
 */
export function calculateMatchScore(volunteer, task) {
  const skillScore = calcSkillMatch(volunteer.skills, task.requiredSkills);
  const locationScore = calcLocationMatch(volunteer.location, task.location);
  const availabilityScore = calcAvailabilityScore(volunteer.availability);
  const urgencyBoost = calcUrgencyBoost(task.urgency);

  const totalScore =
    skillScore * 0.5 +
    locationScore * 0.2 +
    availabilityScore * 0.2 +
    urgencyBoost * 0.1;

  return {
    total: Math.round(totalScore * 100),
    breakdown: {
      skill: Math.round(skillScore * 100),
      location: Math.round(locationScore * 100),
      availability: Math.round(availabilityScore * 100),
      urgency: Math.round(urgencyBoost * 100),
    },
  };
}

/**
 * Generate a rule-based explanation for a match.
 * Used as fallback when Gemini is unavailable.
 */
export function generateRuleBasedExplanation(volunteer, task, score) {
  const parts = [];

  if (score.breakdown.skill >= 50) {
    const matched = volunteer.skills.filter((s) =>
      task.requiredSkills.map((r) => r.toLowerCase()).includes(s.toLowerCase())
    );
    parts.push(
      `Strong skill match: ${volunteer.name} has ${matched.join(', ')} which are needed for this task.`
    );
  } else if (score.breakdown.skill > 0) {
    parts.push(`Partial skill overlap with required competencies.`);
  } else {
    parts.push(`Limited skill match, but other factors compensate.`);
  }

  if (score.breakdown.location === 100) {
    parts.push(`Located in ${volunteer.location}, same as the task area.`);
  }

  if (score.breakdown.availability === 100) {
    parts.push(`Currently available for assignments.`);
  } else {
    parts.push(`Currently unavailable, which may affect response time.`);
  }

  if (task.urgency === 'high') {
    parts.push(`This is a high-urgency task requiring immediate attention.`);
  }

  return parts.join(' ');
}

/**
 * Find the top N volunteer matches for a task.
 */
export function findTopMatches(volunteers, task, topN = 3) {
  const scored = volunteers.map((v) => {
    const score = calculateMatchScore(v, task);
    return {
      volunteerId: v.id,
      volunteerName: v.name,
      volunteer: v,
      score: score.total,
      breakdown: score.breakdown,
      explanation: generateRuleBasedExplanation(v, task, score),
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topN);
}
