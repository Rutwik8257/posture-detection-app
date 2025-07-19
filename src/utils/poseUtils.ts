import { PoseLandmark, PostureAlert, PostureAnalysis, PostureMode } from '../types/pose';

// MediaPipe pose landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32
};

export function calculateAngle(
  point1: PoseLandmark,
  point2: PoseLandmark,
  point3: PoseLandmark
): number {
  const vector1 = {
    x: point1.x - point2.x,
    y: point1.y - point2.y
  };
  
  const vector2 = {
    x: point3.x - point2.x,
    y: point3.y - point2.y
  };
  
  const dot = vector1.x * vector2.x + vector1.y * vector2.y;
  const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
  
  const cosAngle = dot / (mag1 * mag2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  
  return (angle * 180) / Math.PI;
}

export function isKneeOverToe(landmarks: PoseLandmark[]): boolean {
  const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
  const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
  const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
  const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
  
  // Check if knee x-coordinate is significantly beyond ankle x-coordinate
  const leftKneeOverToe = leftKnee.x > leftAnkle.x + 0.05;
  const rightKneeOverToe = rightKnee.x > rightAnkle.x + 0.05;
  
  return leftKneeOverToe || rightKneeOverToe;
}

export function calculateBackAngle(landmarks: PoseLandmark[]): number {
  const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const knee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
  
  return calculateAngle(shoulder, hip, knee);
}

export function calculateNeckAngle(landmarks: PoseLandmark[]): number {
  const nose = landmarks[POSE_LANDMARKS.NOSE];
  const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const hip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  
  return calculateAngle(nose, shoulder, hip);
}

export function isBackStraight(landmarks: PoseLandmark[]): boolean {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
  
  // Calculate shoulder and hip midpoints
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
    visibility: Math.min(leftShoulder.visibility, rightShoulder.visibility)
  };
  
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
    z: (leftHip.z + rightHip.z) / 2,
    visibility: Math.min(leftHip.visibility, rightHip.visibility)
  };
  
  // Check if spine is relatively straight (vertical alignment)
  const spineAngle = Math.abs(Math.atan2(
    shoulderMidpoint.x - hipMidpoint.x,
    shoulderMidpoint.y - hipMidpoint.y
  ) * 180 / Math.PI);
  
  return spineAngle < 20; // Allow 20 degrees deviation
}

export function analyzePosture(
  landmarks: PoseLandmark[],
  mode: PostureMode
): PostureAnalysis {
  const alerts: PostureAlert[] = [];

  // 🔧 FIX: ensure full union type is inferred
  let overallStatus: PostureAnalysis['overallStatus'] = 'good';

  if (mode === PostureMode.SQUAT) {
    if (isKneeOverToe(landmarks)) {
      alerts.push({
        type: 'bad',
        message: 'Knee extending too far forward over toes',
        rule: 'knee_over_toe'
      });
      overallStatus = 'bad';
    }

    const backAngle = calculateBackAngle(landmarks);
    if (backAngle < 150) {
      alerts.push({
        type: 'warning',
        message: `Back angle too low: ${backAngle.toFixed(1)}° (should be >150°)`,
        rule: 'back_angle'
      });
      if (overallStatus === 'good') overallStatus = 'warning';
    }

  } else if (mode === PostureMode.DESK_SITTING) {
    const neckAngle = calculateNeckAngle(landmarks);
    if (neckAngle > 30) {
      alerts.push({
        type: 'warning',
        message: `Neck bent too much: ${neckAngle.toFixed(1)}° (should be <30°)`,
        rule: 'neck_angle'
      });
      if (overallStatus === 'good') overallStatus = 'warning';
    }

    if (!isBackStraight(landmarks)) {
      alerts.push({
        type: 'bad',
        message: 'Back is not straight - improve spinal alignment',
        rule: 'back_straight'
      });
      overallStatus = 'bad';
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'good',
      message: 'Great posture! Keep it up!',
      rule: 'overall'
    });
  }

  return {
    alerts,
    overallStatus,
    confidence: calculateConfidence(landmarks)
  };
}


function calculateConfidence(landmarks: PoseLandmark[]): number {
  const keyLandmarks = [
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE
  ];
  
  const visibilities = keyLandmarks.map(idx => landmarks[idx]?.visibility || 0);
  const avgVisibility = visibilities.reduce((sum, v) => sum + v, 0) / visibilities.length;
  
  return Math.round(avgVisibility * 100);
}