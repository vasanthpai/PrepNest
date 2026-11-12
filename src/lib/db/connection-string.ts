/**
 * Safe handling of DATABASE_URL: describe it and redact it, never print it.
 * A Postgres connection string contains the database password, so anything we log or show
 * about it goes through these helpers first.
 */

export interface ConnectionSummary {
  host: string;
  database: string;
  user: string;
  /** Neon's pooled endpoints have "-pooler" in the host. Apps use pooled; migrations use direct. */
  pooled: boolean;
  /** The sslmode parameter, or "not set". */
  sslmode: string;
}

/**
 * Parse a connection string into the parts that are safe to show. Throws an error whose message
 * never contains the value itself.
 */
export function describeConnectionString(value: string | undefined): ConnectionSummary {
  if (value === undefined || value.trim() === "") {
    throw new Error("DATABASE_URL is not set");
  }
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must start with postgresql:// or postgres://");
  }
  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (url.hostname === "" || database === "") {
    throw new Error("DATABASE_URL must include a host and a database name");
  }
  return {
    host: url.hostname,
    database,
    user: decodeURIComponent(url.username),
    pooled: url.hostname.includes("-pooler."),
    sslmode: url.searchParams.get("sslmode") ?? "not set",
  };
}

const MIN_PASSWORD_LENGTH = 6;

/**
 * Remove connection strings and the password from text that may be shown or logged,
 * such as a driver error message.
 */
export function redactSecrets(text: string, connectionString?: string): string {
  let result = text;
  if (connectionString) {
    try {
      const password = decodeURIComponent(new URL(connectionString.trim()).password);
      // A very short "password" (like "p" in a typo'd URL) would mangle ordinary words.
      // Real database passwords are long; whole connection strings are still removed below.
      if (password.length >= MIN_PASSWORD_LENGTH) result = result.split(password).join("***");
    } catch {
      // Not a URL: only the pattern below applies.
    }
    result = result.split(connectionString).join("postgresql://***");
  }
  return result.replace(/postgres(?:ql)?:\/\/[^\s'"`]+/g, "postgresql://***");
}
