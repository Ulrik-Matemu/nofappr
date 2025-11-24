const STORAGE_KEYS = {
  START_DATE: 'nofap_start_date',
  CHECK_INS: 'nofap_check_ins',
  JOURNAL: 'nofap_journal',
  ONBOARDING_COMPLETE: 'nofap_onboarding_complete',
};

export const getOnboardingStatus = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
};

export const setOnboardingComplete = () => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
};

export const getStreak = (): number => {
  const startDate = localStorage.getItem(STORAGE_KEYS.START_DATE);
  if (!startDate) return 0;

  const start = new Date(startDate);
  const now = new Date();
  // Calculate difference in milliseconds
  const diffTime = now.getTime() - start.getTime();
  // Convert to days (floor to get completed days, or use your preference)
  // Using floor to represent "days completed" or similar logic.
  // If start date is today, diff is 0 days.
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays < 0 ? 0 : diffDays; 
};

export const resetStreak = () => {
  localStorage.setItem(STORAGE_KEYS.START_DATE, new Date().toISOString());
};

export interface CheckIn {
  date: string;
  mood: 'happy' | 'neutral' | 'sad';
}

export const saveCheckIn = (mood: CheckIn['mood']) => {
  const checkInsStr = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  const checkIns: CheckIn[] = checkInsStr ? JSON.parse(checkInsStr) : [];
  
  const today = new Date().toISOString().split('T')[0];
  const existingIndex = checkIns.findIndex(c => c.date === today);
  
  const newCheckIn = { date: today, mood };

  if (existingIndex >= 0) {
    checkIns[existingIndex] = newCheckIn;
  } else {
    checkIns.push(newCheckIn);
  }

  localStorage.setItem(STORAGE_KEYS.CHECK_INS, JSON.stringify(checkIns));
};

export const getTodayMood = (): CheckIn['mood'] | null => {
  const checkInsStr = localStorage.getItem(STORAGE_KEYS.CHECK_INS);
  if (!checkInsStr) return null;
  
  const checkIns: CheckIn[] = JSON.parse(checkInsStr);
  const today = new Date().toISOString().split('T')[0];
  return checkIns.find(c => c.date === today)?.mood || null;
};

export interface JournalEntry {
  date: string;
  text: string;
}

export const saveJournalEntry = (text: string) => {
  const journalStr = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  const journal: JournalEntry[] = journalStr ? JSON.parse(journalStr) : [];
  
  const today = new Date().toISOString().split('T')[0];
  const existingIndex = journal.findIndex(j => j.date === today);
  
  const newEntry = { date: today, text };

  if (existingIndex >= 0) {
    journal[existingIndex] = newEntry;
  } else {
    journal.push(newEntry);
  }

  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journal));
};

export const getTodayJournal = (): string => {
  const journalStr = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  if (!journalStr) return '';
  
  const journal: JournalEntry[] = JSON.parse(journalStr);
  const today = new Date().toISOString().split('T')[0];
  return journal.find(j => j.date === today)?.text || '';
};
