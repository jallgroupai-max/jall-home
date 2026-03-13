const REMEMBER_ENABLED_COOKIE = "jallai_remember_enabled";
const REMEMBER_EMAIL_COOKIE = "jallai_remember_email";
const REMEMBER_PASSWORD_COOKIE = "jallai_remember_password";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type RememberedAuth = {
  email: string;
  password: string;
  remember: boolean;
};

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function getCookie(name: string) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const value = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  if (!value) {
    return "";
  }

  return decodeURIComponent(value.slice(name.length + 1));
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getRememberedAuth(): RememberedAuth {
  const remember = getCookie(REMEMBER_ENABLED_COOKIE) === "true";

  if (!remember) {
    return { email: "", password: "", remember: false };
  }

  return {
    email: getCookie(REMEMBER_EMAIL_COOKIE),
    password: getCookie(REMEMBER_PASSWORD_COOKIE),
    remember: true,
  };
}

export function saveRememberedAuth(email: string, password: string) {
  setCookie(REMEMBER_ENABLED_COOKIE, "true", COOKIE_MAX_AGE);
  setCookie(REMEMBER_EMAIL_COOKIE, email, COOKIE_MAX_AGE);
  setCookie(REMEMBER_PASSWORD_COOKIE, password, COOKIE_MAX_AGE);
}

export function clearRememberedAuth() {
  deleteCookie(REMEMBER_ENABLED_COOKIE);
  deleteCookie(REMEMBER_EMAIL_COOKIE);
  deleteCookie(REMEMBER_PASSWORD_COOKIE);
}
