export type UserRole = 
  | 'saas_owner' 
  | 'academy_admin' 
  | 'head_coach' 
  | 'assistant_coach' 
  | 'student' 
  | 'parent';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  academyId?: string;
  academyName?: string;
  avatar: string;
  permissions: string[];
  token?: string;
}

export interface DemoCredential {
  role: UserRole;
  roleTitle: string;
  badge: string;
  name: string;
  email: string;
  password: string;
  academyName?: string;
  description: string;
  permissionsSummary: string[];
}

export const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  saas_owner: ['*'],
  academy_admin: [
    'academy:manage',
    'academy:billing',
    'coaches:manage',
    'students:manage',
    'batches:manage',
    'classroom:view',
    'reports:view',
    'reports:send'
  ],
  head_coach: [
    'classroom:master',
    'classroom:simul',
    'classroom:draw',
    'classroom:view',
    'homework:create',
    'homework:grade',
    'tournaments:manage',
    'students:notes',
    'reports:send'
  ],
  assistant_coach: [
    'classroom:assist',
    'classroom:view',
    'attendance:mark',
    'homework:grade',
    'students:view',
    'tournaments:view'
  ],
  student: [
    'classroom:attend',
    'homework:submit',
    'puzzles:solve',
    'tournaments:play'
  ],
  parent: [
    'reports:view',
    'attendance:view'
  ]
};

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: 'saas_owner',
    roleTitle: 'SaaS Platform Owner (You)',
    badge: 'Superadmin',
    name: 'Platform Owner (You)',
    email: 'owner@chessplay.in',
    password: 'OwnerPass#2026',
    description: 'Complete cross-academy administrative access, platform subscription metrics, revenue, and global settings.',
    permissionsSummary: [
      'Manage all academies and tenant subscriptions',
      'View global MRR, revenue & analytics',
      'Oversee engine server health and API quotas',
      'Full root permissions (*)'
    ]
  },
  {
    role: 'academy_admin',
    roleTitle: 'Academy Admin / Director',
    badge: 'Academy Owner',
    name: 'Rajesh Kumar',
    email: 'admin@achieverschess.com',
    password: 'AdminPass#2026',
    academyName: "Achiever's Chess Academy",
    description: 'Manages academy branches, invites and assigns coaches, handles parent billing, and configures academy branding.',
    permissionsSummary: [
      'Invite, edit and manage coaches',
      'Manage student roster and batches',
      'Configure academy branding and colors',
      'Access fee collection and revenue reports'
    ]
  },
  {
    role: 'head_coach',
    roleTitle: 'Head Coach (Senior Grandmaster)',
    badge: 'Senior Coach',
    name: 'GM Vikram Sen',
    email: 'headcoach@achieverschess.com',
    password: 'CoachPass#2026',
    academyName: "Achiever's Chess Academy",
    description: 'Conducts live interactive masterclasses, manages 6-board simul grids, creates homework, and hosts official Swiss tournaments.',
    permissionsSummary: [
      'Full live classroom & board lock control',
      'Simul multi-board 6-student monitoring',
      'Create and schedule homework curricula',
      'Host Swiss & Arena tournaments with FIDE pairings'
    ]
  },
  {
    role: 'assistant_coach',
    roleTitle: 'Assistant Coach',
    badge: 'Co-Pilot Coach',
    name: 'Pooja Sharma',
    email: 'assistant@achieverschess.com',
    password: 'AssistantPass#2026',
    academyName: "Achiever's Chess Academy",
    description: 'Assists in live classroom sessions, reviews student puzzle attempts, marks batch attendance, and grades homework.',
    permissionsSummary: [
      'Join live classes as classroom co-host',
      'Mark student attendance for assigned batches',
      'Grade and review tactical homework submissions',
      'Restricted: Cannot delete courses or edit billing'
    ]
  },
  {
    role: 'student',
    roleTitle: 'Academy Student (Batch Alpha)',
    badge: 'Student',
    name: 'Aarav Sharma',
    email: 'student@achieverschess.com',
    password: 'StudentPass#2026',
    academyName: "Achiever's Chess Academy",
    description: 'Enrolled in Batch Alpha. Can solve interactive chess homework, play simul drills, and attend live masterclasses.',
    permissionsSummary: [
      'Solve interactive tactical homework & drills',
      'Attend live masterclasses and move on personal board',
      'Track puzzle rating and drill completion history',
      'Participate in academy Swiss tournaments'
    ]
  }
];
