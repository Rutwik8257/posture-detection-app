export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PostureRules {
  squat: {
    kneeOverToe: boolean;
    backAngle: number;
  };
  deskSitting: {
    neckAngle: number;
    backStraight: boolean;
  };
}

export interface PostureAlert {
  type: 'good' | 'warning' | 'bad';
  message: string;
  rule: string;
}

export interface PostureAnalysis {
  alerts: PostureAlert[];
  overallStatus: 'good' | 'warning' | 'bad';
  confidence: number;
}

export enum PostureMode {
  SQUAT = 'squat',
  DESK_SITTING = 'desk_sitting'
}