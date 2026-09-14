const normalizeBirthday = (value, fallback = { month: 1, day: 1 }) => {
  const month = Number(value?.month ?? fallback.month);
  const day = Number(value?.day ?? fallback.day);
  return {
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : Number(fallback.month),
    day: Number.isInteger(day) && day >= 1 && day <= 31 ? day : Number(fallback.day)
  };
};

const normalizeRecipient = (value, fallback = "you") => {
  const nextValue = String(value ?? fallback).trim();
  return nextValue || fallback;
};

const normalizeTheme = (value, fallback = "cherry", themes = {}) => {
  const nextValue = String(value ?? fallback).trim();
  return Object.prototype.hasOwnProperty.call(themes, nextValue) ? nextValue : fallback;
};

const resolveProfile = (search, savedSettings = null, defaultConfig = { recipient: "you", birthday: { month: 1, day: 1 }, theme: "cherry" }, themes = {}) => {
  const params = new URLSearchParams(search || "");
  const hasQueryProfile = params.has("recipient") || params.has("month") || params.has("day") || params.has("theme");

  if (hasQueryProfile) {
    return {
      recipient: normalizeRecipient(params.get("recipient"), defaultConfig.recipient),
      birthday: normalizeBirthday({ month: params.get("month"), day: params.get("day") }, defaultConfig.birthday),
      theme: normalizeTheme(params.get("theme"), defaultConfig.theme, themes)
    };
  }

  if (savedSettings && (savedSettings.recipient || savedSettings.birthday)) {
    return {
      recipient: normalizeRecipient(savedSettings.recipient, defaultConfig.recipient),
      birthday: normalizeBirthday(savedSettings.birthday, defaultConfig.birthday),
      theme: normalizeTheme(savedSettings.theme, defaultConfig.theme, themes)
    };
  }

  return {
    recipient: normalizeRecipient(defaultConfig.recipient),
    birthday: normalizeBirthday(defaultConfig.birthday, defaultConfig.birthday),
    theme: normalizeTheme(defaultConfig.theme, defaultConfig.theme, themes)
  };
};

if (typeof module !== "undefined") {
  module.exports = {
    normalizeBirthday,
    normalizeRecipient,
    normalizeTheme,
    resolveProfile
  };
}

if (typeof globalThis !== "undefined") {
  globalThis.ProfileUtils = { normalizeBirthday, normalizeRecipient, resolveProfile };
}
