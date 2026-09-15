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

const toBase64Url = (value) => {
  if (typeof Buffer !== "undefined") return Buffer.from(value, "utf8").toString("base64url");

  const binary = typeof btoa === "function" ? btoa(unescape(encodeURIComponent(value))) : value;
  return binary.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value) => {
  if (!value) return "";

  if (typeof Buffer !== "undefined") return Buffer.from(String(value), "base64url").toString("utf8");

  let normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) normalized += "=";
  const binary = typeof atob === "function" ? atob(normalized) : normalized;
  return decodeURIComponent(escape(binary));
};

const encodeProfileShare = (profile = {}) => {
  const safeTheme = String(profile.theme ?? "cherry").trim() || "cherry";
  const safeProfile = {
    recipient: normalizeRecipient(profile.recipient, "you"),
    month: Number(profile.month ?? profile.birthday?.month ?? 1),
    day: Number(profile.day ?? profile.birthday?.day ?? 1),
    theme: safeTheme
  };

  const payload = `${encodeURIComponent(safeProfile.recipient)}|${safeProfile.month}|${safeProfile.day}|${encodeURIComponent(safeProfile.theme)}`;
  return toBase64Url(payload);
};

const decodeProfileShare = (encoded = "") => {
  if (!encoded) return null;

  try {
    const decoded = fromBase64Url(String(encoded));
    const [recipient, month, day, theme] = decoded.split("|");
    if (!recipient || !month || !day || !theme) return null;

    return {
      recipient: decodeURIComponent(recipient),
      month: Number(month),
      day: Number(day),
      theme: decodeURIComponent(theme)
    };
  } catch (error) {
    return null;
  }
};

const resolveProfile = (search, savedSettings = null, defaultConfig = { recipient: "you", birthday: { month: 1, day: 1 }, theme: "cherry" }, themes = {}) => {
  const params = new URLSearchParams(search || "");
  const sharedSecret = params.get("share");
  if (sharedSecret) {
    const decoded = decodeProfileShare(sharedSecret);
    if (decoded) {
      return {
        recipient: normalizeRecipient(decoded.recipient, defaultConfig.recipient),
        birthday: normalizeBirthday({ month: decoded.month, day: decoded.day }, defaultConfig.birthday),
        theme: normalizeTheme(decoded.theme, defaultConfig.theme, themes)
      };
    }
  }

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
    encodeProfileShare,
    decodeProfileShare,
    resolveProfile
  };
}

if (typeof globalThis !== "undefined") {
  globalThis.ProfileUtils = { normalizeBirthday, normalizeRecipient, normalizeTheme, encodeProfileShare, decodeProfileShare, resolveProfile };
}
