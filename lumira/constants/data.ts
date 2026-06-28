export type PaymentRecord = {
  dateISO: string;
  amount: number;
  method: string;
  note: string;
};

export type Assignment = {
  memberId: string;       // team_members.id, or 'ext-…' for external crew
  role: string;
  name?: string;          // set only for external crew who aren't on the team
  color?: string;         // avatar color for external crew
};

export type Event = {
  id: string;
  type: string;
  title: string;
  dateISO: string;
  timeLabel: string;
  venue: string;
  clientName: string;
  clientPhone: string;
  assigned: Assignment[];
  total: number;
  notes: string;
  payments: PaymentRecord[];
  createdByUserId: string | null;
};

export type Member = {
  id: string;             // team_members.id
  userId: string;         // profiles.id
  name: string;
  role: string;
  color: string;
  photoUrl: string | null;
  isMe?: boolean;
};

export type Team = {
  id: string;
  name: string;
  initials: string;
  color: string;
  userRole: string;
  members: Member[];
  inviteCode: string;
};
