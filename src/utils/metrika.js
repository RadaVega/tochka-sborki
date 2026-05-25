const COUNTER_ID = 109303611;

export const GOALS = {
  OPEN_TELEGRAM: 'OPEN_TELEGRAM',
  OPEN_VK_GROUP: 'OPEN_VK_GROUP',
  OPEN_MAX_CHANNEL: 'OPEN_MAX_CHANNEL',
  COMPANY_FORM_SUCCESS: 'COMPANY_FORM_SUCCESS',
  STUDENT_FORM_SUCCESS: 'STUDENT_FORM_SUCCESS',
  HERO_CTA_COMPANY: 'HERO_CTA_COMPANY',
  HERO_CTA_STUDENT: 'HERO_CTA_STUDENT',
  CONTACT_FORM_SUCCESS: 'CONTACT_FORM_SUCCESS',
  SUBSCRIBE_SUCCESS: 'SUBSCRIBE_SUCCESS',
  CONTACT_CHANNEL_CLICK: 'CONTACT_CHANNEL_CLICK',
};

export const reachGoal = (goalName, params = {}) => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(COUNTER_ID, 'reachGoal', goalName, params);
    console.log('[Metrika] Goal:', goalName, params);
    return true;
  }
  console.warn('[Metrika] ym not loaded. Missed:', goalName);
  return false;
};