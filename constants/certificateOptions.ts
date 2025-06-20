// Frontend-only certificate options that don't need backend storage
// These options are used during certificate generation

export const ACHIEVEMENT_OPTIONS = [
  'Winner',
  'Champion',
  'Excellence',
  'Outstanding Performance',
  'Exceptional Achievement',
  'First Prize',
  'Second Prize', 
  'Third Prize',
  'Gold Medal',
  'Silver Medal',
  'Bronze Medal',
  'Best Performance',
  'Top Performer',
  'Distinguished Achievement',
  'Merit Award',
  'Honor Roll',
  'Dean\'s List',
  'Summa Cum Laude',
  'Magna Cum Laude',
  'Cum Laude',
  'Certificate of Achievement',
  'Certificate of Excellence',
  'Certificate of Completion',
  'Certificate of Participation',
  'Certificate of Recognition',
  'Outstanding Contribution',
  'Leadership Excellence',
  'Innovation Award',
  'Team Player',
  'Most Improved',
  'Perfect Attendance',
  'Academic Excellence',
  'Athletic Excellence',
  'Artistic Excellence',
  'Technical Excellence',
  'Community Service',
  'Volunteer Recognition',
  'Special Recognition',
  'Lifetime Achievement'
];

export const POSITION_OPTIONS = [
  '1st Place',
  '2nd Place', 
  '3rd Place',
  '4th Place',
  '5th Place',
  '6th Place',
  '7th Place',
  '8th Place',
  '9th Place',
  '10th Place',
  'Winner',
  'Runner-up',
  'Second Runner-up',
  'Finalist',
  'Semi-finalist',
  'Quarter-finalist',
  'Champion',
  'Vice Champion',
  'Gold Medalist',
  'Silver Medalist',
  'Bronze Medalist',
  'Top 10',
  'Top 5',
  'Top 3',
  'Best in Category',
  'Category Winner',
  'Division Winner',
  'Regional Champion',
  'National Champion',
  'International Champion',
  'Grand Prize Winner',
  'Special Prize Winner',
  'People\'s Choice',
  'Judge\'s Choice',
  'Editor\'s Choice',
  'Most Popular',
  'Most Creative',
  'Most Innovative',
  'Best Design',
  'Best Presentation'
];

// Certificate title options (also frontend-only)
export const CERTIFICATE_TITLE_OPTIONS = [
  'Certificate of Achievement',
  'Certificate of Excellence',
  'Certificate of Completion',
  'Certificate of Participation',
  'Certificate of Recognition',
  'Certificate of Appreciation',
  'Certificate of Merit',
  'Certificate of Honor',
  'Award Certificate',
  'Achievement Award',
  'Excellence Award',
  'Recognition Award',
  'Participation Award',
  'Completion Award',
  'Merit Award',
  'Honor Award',
  'Distinguished Service Award',
  'Outstanding Performance Award',
  'Leadership Award',
  'Innovation Award',
  'Academic Achievement Certificate',
  'Athletic Achievement Certificate',
  'Artistic Achievement Certificate',
  'Technical Achievement Certificate',
  'Community Service Certificate',
  'Volunteer Service Certificate',
  'Training Certificate',
  'Course Completion Certificate',
  'Workshop Certificate',
  'Seminar Certificate',
  'Conference Certificate',
  'Diploma',
  'Degree Certificate',
  'Professional Certificate',
  'Skill Certificate',
  'Competency Certificate'
];

// Helper function to get all options
export const getCertificateOptions = () => ({
  achievements: ACHIEVEMENT_OPTIONS,
  positions: POSITION_OPTIONS,
  titles: CERTIFICATE_TITLE_OPTIONS
});

// Helper function to check if an option exists
export const isValidAchievement = (achievement: string): boolean => {
  return ACHIEVEMENT_OPTIONS.includes(achievement);
};

export const isValidPosition = (position: string): boolean => {
  return POSITION_OPTIONS.includes(position);
};

export const isValidTitle = (title: string): boolean => {
  return CERTIFICATE_TITLE_OPTIONS.includes(title);
};
