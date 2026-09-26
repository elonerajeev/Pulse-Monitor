import crypto from "crypto";

const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "x-xsrf-token";
const UNSAFE_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

// Paths that authenticate by other means and must not be blocked by CSRF.
// Stripe signs its webhooks, so the signature check is the real guard there.
const EXEMPT_PATHS = ["/api/v1/stripe/webhook"];

// Route families that carry their own credential in the URL. CSRF defends
// against a browser replaying ambient cookies cross-site; these routes use no
// ambient credential at all, and their callers are cron lines and CI steps that
// have no cookie jar to begin with.
const EXEMPT_PREFIXES = ["/api/v1/heartbeats/ping/"];

const isProduction = () => process.env.NODE_ENV === "production";

const safeEquals = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// Issues the double-submit cookie. It is deliberately readable by JavaScript:
// the client has to echo it back in a header, which is what proves the request
// did not come from a cross-site form.
export const issueCsrfToken = (req, res, next) => {
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: isProduction(),
      sameSite: isProduction() ? "none" : "lax",
      path: "/",
    });
    // Make it available to the verifier within this same request, so a client's
    // very first call does not have to be a throwaway GET.
    req.cookies = { ...req.cookies, [CSRF_COOKIE]: token };
    res.locals.csrfToken = token;
  }
  next();
};

// Hands the current token to the client in the response body.
//
// The frontend and the API sit on different domains in production, so the
// client cannot read the XSRF-TOKEN cookie with document.cookie. It fetches
// the value from here instead and echoes it back in the header; the cookie
// itself still rides along (SameSite=None) as the other half of the pair.
export const getCsrfToken = (req, res) => {
  res.status(200).json({
    success: true,
    csrfToken: res.locals.csrfToken || req.cookies?.[CSRF_COOKIE] || null,
  });
};

export const verifyCsrfToken = (req, res, next) => {
  if (!UNSAFE_METHODS.includes(req.method)) return next();
  const path = req.originalUrl.split("?")[0];
  if (EXEMPT_PATHS.includes(path)) return next();
  if (EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !safeEquals(cookieToken, headerToken)) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }
  next();
};
