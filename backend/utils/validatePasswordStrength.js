export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== "string") {
    return { ok: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters" };
  }
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLower || !hasUpper || !hasNumber) {
    return {
      ok: false,
      message: "Password must include uppercase, lowercase, and a number",
    };
  }
  return { ok: true };
};
