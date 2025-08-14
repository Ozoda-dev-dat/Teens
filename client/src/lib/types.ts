export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
}

export interface StudentWithUser {
  id: string;
  userId: string;
  studentId: string;
  groupId?: string;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  group?: {
    id: string;
    name: string;
    description?: string;
    schedule?: string;
  };
}

export interface MedalWithData {
  id: string;
  studentId: string;
  type: 'gold' | 'silver' | 'bronze';
  reason: string;
  awardedBy: string;
  createdAt: Date;
  student?: {
    id: string;
    studentId: string;
  };
  user?: {
    id: string;
    name: string;
  };
  awardedBy?: {
    id: string;
    name: string;
  };
}

export interface DashboardStats {
  totalGroups: number;
  totalStudents: number;
  medalsAwarded: number;
  attendanceRate: string;
}
