export type PaymentRecord = {
  dateISO: string;
  amount: number;
  method: string;
  note: string;
};

export type Assignment = {
  memberId: string;
  role: string;
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
};

export type Member = {
  id: string;
  name: string;
  role: string;
  color: string;
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

export const TEAMS: Record<string, Team> = {
  A: {
    id: 'A',
    name: 'Lumière Co.',
    initials: 'LC',
    color: '#7C5CFC',
    userRole: 'Owner',
    inviteCode: 'LUM4X9',
    members: [
      { id: 'a1', name: 'Aanya Mehra', role: 'Owner · Lead Photographer', color: '#7C5CFC', isMe: true },
      { id: 'a2', name: 'Rohan Kapoor', role: 'Photographer', color: '#FF6B5E' },
      { id: 'a3', name: 'Diya Sharma', role: 'Photographer', color: '#12C9A6' },
      { id: 'a4', name: 'Kabir Singh', role: 'Videographer', color: '#2E8BFF' },
      { id: 'a5', name: 'Ishaan Verma', role: 'Editor', color: '#F59E0B' },
    ],
  },
  B: {
    id: 'B',
    name: 'Frame Films',
    initials: 'FF',
    color: '#FF6B5E',
    userRole: 'Member',
    inviteCode: 'FRM9Z2',
    members: [
      { id: 'a1', name: 'Aanya Mehra', role: 'Director', color: '#7C5CFC', isMe: true },
      { id: 'b2', name: 'Maya Iyer', role: 'Cinematographer', color: '#FF4D8D' },
      { id: 'b3', name: 'Dev Patel', role: 'Editor', color: '#12C9A6' },
    ],
  },
};

export const EVENTS: Record<string, Event[]> = {
  A: [
    {
      id: 'e1', type: 'Wedding', title: 'Aanya & Vikram Wedding',
      dateISO: '2026-06-08', timeLabel: '4:00 PM – 11:30 PM',
      venue: 'Taj Lands End, Mumbai',
      clientName: 'Vikram Sethi', clientPhone: '+91 98200 11234',
      assigned: [
        { memberId: 'a1', role: 'Lead Photographer' },
        { memberId: 'a2', role: 'Photographer' },
        { memberId: 'a4', role: 'Videographer' },
        { memberId: 'a5', role: 'Editor' },
      ],
      total: 185000,
      notes: 'Bride prep coverage from 2 PM. Drone permitted for outdoor shots. Deliver teaser within 10 days.',
      payments: [
        { dateISO: '2026-04-10', amount: 60000, method: 'UPI', note: 'Booking advance' },
        { dateISO: '2026-05-20', amount: 40000, method: 'Bank transfer', note: '2nd installment' },
      ],
    },
    {
      id: 'e2', type: 'PreWedding', title: 'Sneha & Arjun Pre-Wedding',
      dateISO: '2026-06-12', timeLabel: '6:30 AM – 10:00 AM',
      venue: 'Lodhi Garden, Delhi',
      clientName: 'Sneha Rao', clientPhone: '+91 99100 44521',
      assigned: [
        { memberId: 'a1', role: 'Lead Photographer' },
        { memberId: 'a3', role: 'Photographer' },
      ],
      total: 45000,
      notes: 'Golden-hour sunrise shoot. Two outfit changes planned.',
      payments: [
        { dateISO: '2026-05-01', amount: 20000, method: 'UPI', note: 'Advance' },
        { dateISO: '2026-06-12', amount: 25000, method: 'Cash', note: 'Balance on shoot day' },
      ],
    },
    {
      id: 'e3', type: 'Corporate', title: 'TechNova Annual Conference',
      dateISO: '2026-06-15', timeLabel: '9:00 AM – 6:00 PM',
      venue: 'JW Marriott, Bengaluru',
      clientName: 'Priya Nair', clientPhone: '+91 80450 77810',
      assigned: [
        { memberId: 'a2', role: 'Lead Photographer' },
        { memberId: 'a4', role: 'Videographer' },
      ],
      total: 120000,
      notes: 'Keynote + breakout session coverage. Same-day highlight reel required.',
      payments: [
        { dateISO: '2026-05-15', amount: 60000, method: 'Bank transfer', note: '50% advance' },
      ],
    },
    {
      id: 'e7', type: 'Portrait', title: 'Bansal Newborn Shoot',
      dateISO: '2026-06-05', timeLabel: '11:00 AM – 1:00 PM',
      venue: 'Client home, Gurugram',
      clientName: 'Ritu Bansal', clientPhone: '+91 98991 22043',
      assigned: [{ memberId: 'a3', role: 'Photographer' }],
      total: 12000,
      notes: 'Studio props provided. Keep room warm for the baby.',
      payments: [{ dateISO: '2026-06-05', amount: 12000, method: 'Cash', note: 'Paid in full' }],
    },
    {
      id: 'e5', type: 'Event', title: 'Mehta Engagement Party',
      dateISO: '2026-06-27', timeLabel: '7:00 PM – 11:00 PM',
      venue: 'The Leela, Mumbai',
      clientName: 'Anil Mehta', clientPhone: '+91 98201 55678',
      assigned: [
        { memberId: 'a1', role: 'Lead Photographer' },
        { memberId: 'a2', role: 'Photographer' },
      ],
      total: 75000,
      notes: 'Ring exchange around 8:30 PM. Focus on candid family moments.',
      payments: [{ dateISO: '2026-05-28', amount: 30000, method: 'UPI', note: 'Advance' }],
    },
    {
      id: 'e4', type: 'Portrait', title: 'Kapoor Family Portraits',
      dateISO: '2026-06-29', timeLabel: '5:00 PM – 7:00 PM',
      venue: 'Aperture Studio, Delhi',
      clientName: 'Meera Kapoor', clientPhone: '+91 99580 33129',
      assigned: [
        { memberId: 'a3', role: 'Photographer' },
        { memberId: 'a5', role: 'Assistant' },
      ],
      total: 18000,
      notes: 'Three-generation family portrait. 12 retouched images included.',
      payments: [],
    },
    {
      id: 'e8', type: 'Corporate', title: 'Zenith Product Launch',
      dateISO: '2026-06-30', timeLabel: '10:00 AM – 4:00 PM',
      venue: 'Grand Hyatt, Mumbai',
      clientName: 'Sameer Joshi', clientPhone: '+91 98330 90021',
      assigned: [
        { memberId: 'a2', role: 'Lead Photographer' },
        { memberId: 'a4', role: 'Videographer' },
        { memberId: 'a5', role: 'Editor' },
      ],
      total: 95000,
      notes: 'Press wall + product close-ups. NDA in effect on unreleased product.',
      payments: [],
    },
    {
      id: 'e6', type: 'Wedding', title: 'Riya & Karan Wedding',
      dateISO: '2026-07-04', timeLabel: '3:00 PM – 12:00 AM',
      venue: 'ITC Grand, Goa',
      clientName: 'Karan Malhotra', clientPhone: '+91 90040 67712',
      assigned: [
        { memberId: 'a1', role: 'Lead Photographer' },
        { memberId: 'a2', role: 'Photographer' },
        { memberId: 'a3', role: 'Photographer' },
        { memberId: 'a4', role: 'Videographer' },
      ],
      total: 220000,
      notes: 'Destination wedding, two-day coverage. Travel and stay already booked.',
      payments: [
        { dateISO: '2026-03-30', amount: 50000, method: 'Bank transfer', note: 'Booking advance' },
      ],
    },
  ],
  B: [
    {
      id: 'b1', type: 'Wedding', title: 'Nair Wedding Film',
      dateISO: '2026-06-14', timeLabel: '5:00 PM – 11:00 PM',
      venue: 'Bolgatty Palace, Kochi',
      clientName: 'Arun Nair', clientPhone: '+91 94470 11200',
      assigned: [
        { memberId: 'a1', role: 'Director' },
        { memberId: 'b2', role: 'Cinematographer' },
        { memberId: 'b3', role: 'Editor' },
      ],
      total: 160000,
      notes: 'Cinematic wedding film plus a 3-minute teaser.',
      payments: [
        { dateISO: '2026-05-10', amount: 80000, method: 'Bank transfer', note: '50% advance' },
      ],
    },
    {
      id: 'b2e', type: 'Corporate', title: 'Acme Brand Video',
      dateISO: '2026-06-22', timeLabel: '10:00 AM – 5:00 PM',
      venue: 'Acme HQ, Pune',
      clientName: 'Tara Shah', clientPhone: '+91 98220 44556',
      assigned: [
        { memberId: 'b2', role: 'Cinematographer' },
        { memberId: 'b3', role: 'Editor' },
      ],
      total: 90000,
      notes: 'Two brand films and a set of social reels.',
      payments: [
        { dateISO: '2026-05-25', amount: 90000, method: 'Bank transfer', note: 'Paid in full' },
      ],
    },
    {
      id: 'b3e', type: 'Event', title: 'Soundscape Aftermovie',
      dateISO: '2026-07-02', timeLabel: '6:00 PM – 1:00 AM',
      venue: 'Mahalaxmi Grounds, Mumbai',
      clientName: 'Festival Co.', clientPhone: '+91 90000 12345',
      assigned: [
        { memberId: 'a1', role: 'Director' },
        { memberId: 'b2', role: 'Cinematographer' },
      ],
      total: 60000,
      notes: 'Multi-cam festival aftermovie.',
      payments: [],
    },
  ],
};
