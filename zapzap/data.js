// User profiles: each has hardcoded weather (no API). Sent as _psc in Alloy.
// planLabel, dataUsedGB, dataLimitGB, minutesUsed, minutesLimit, smsUsed, smsLimit are UI-only (not sent to backend).
const ZAPZAP_USERS = [
  { id: "10001", name: "Alex Morgan", temperature: 32, planType: "individual", weatherConditions: "Winter", cityName: "Cold City", planLabel: "Individual", dataUsedGB: 4.2, dataLimitGB: 10, minutesUsed: 120, minutesLimit: 500, smsUsed: 45, smsLimit: 200 },
  { id: "10002", name: "Jordan Lee", temperature: 70, planType: "family", weatherConditions: "Spring", cityName: "Springfield", planLabel: "Family Unlimited", dataUsedGB: 28, dataLimitGB: null, minutesUsed: 420, minutesLimit: null, smsUsed: 890, smsLimit: null },
  { id: "10003", name: "Sam Chen", temperature: 85, planType: "internetbundle", weatherConditions: "Summer", cityName: "Summerville", planLabel: "Internet Bundle", dataUsedGB: 76, dataLimitGB: 100, minutesUsed: null, minutesLimit: null, smsUsed: null, smsLimit: null },
  { id: "10004", name: "Riley Davis", temperature: 65, planType: "tvinternetbundle", weatherConditions: "Fall", cityName: "Autumn Hills", planLabel: "TV + Internet", dataUsedGB: 120, dataLimitGB: 150, minutesUsed: null, minutesLimit: null, smsUsed: null, smsLimit: null }
];
