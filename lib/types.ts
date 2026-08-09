export interface ConfessionComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Confession {
  id: string;
  alias: string;
  batch: string;
  timestamp: string;
  category: "Academics" | "Rants" | "Campus Life" | "Romance" | "Placements" | "Hostel";
  content: string;
  likes: number;
  hasLiked?: boolean;
  comments: ConfessionComment[];
  isTrending?: boolean;
  tags: string[];
  status?: "PENDING" | "APPROVED" | "REJECTED";
  isApproved?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  semester: string;
  category: "Notes" | "PYQ" | "Practical" | "Tool" | "Roadmap";
  author: string;
  verified: boolean;
  format: "PDF" | "ZIP" | "Code" | "Drive";
  fileSize: string;
  downloads: number;
  rating: number;
  linkUrl: string;
  description: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: "Hackathon" | "Internship" | "Scholarship" | "Workshop";
  location: "Remote" | "On-site" | "Hybrid";
  locationDetail?: string;
  stipendOrPrize: string;
  deadline: string;
  daysRemaining: number;
  tags: string[];
  description: string;
  eligibility: string;
  applyUrl: string;
  isFeatured?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  isApproved?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  category: "Workshop" | "Meetup" | "Hackathon" | "Tech Talk" | "Guest Talk";
  date: string;
  month: string;
  day: string;
  time: string;
  venue: string;
  isOnline: boolean;
  speaker: {
    name: string;
    role: string;
    company: string;
  };
  totalSeats: number;
  registeredCount: number;
  description: string;
  tags: string[];
  status?: "PENDING" | "APPROVED" | "REJECTED";
  isApproved?: boolean;
}

export interface RuleItem {
  number: string;
  title: string;
  tagline: string;
  summary: string;
  dos: string[];
  donts: string[];
  consequence: string;
}

export interface CommunityStat {
  label: string;
  value: string;
  subtext: string;
  iconName: string;
}
