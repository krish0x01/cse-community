import { Confession, Resource, Opportunity, EventItem, CommunityStat } from "./types";

export const COMMUNITY_STATS: CommunityStat[] = [
  {
    label: "Active Engineers",
    value: "4,850+",
    subtext: "Across 4 batches & alumni",
    iconName: "Users",
  },
  {
    label: "Anonymous Confessions",
    value: "0+",
    subtext: "100% wholesome & unfiltered",
    iconName: "MessageSquareQuote",
  },
  {
    label: "Curated Resources",
    value: "0+",
    subtext: "PYQs, practicals & notes",
    iconName: "FileCode2",
  },
  {
    label: "Opportunities Bagged",
    value: "0+",
    subtext: "Internships & hackathon wins",
    iconName: "Sparkles",
  },
];

export const MOCK_CONFESSIONS: Confession[] = [];
export const MOCK_RESOURCES: Resource[] = [];
export const MOCK_OPPORTUNITIES: Opportunity[] = [];
export const MOCK_EVENTS: EventItem[] = [];
