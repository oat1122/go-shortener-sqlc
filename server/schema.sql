CREATE TABLE urls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  short_code VARCHAR(20) NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  url_hash CHAR(64) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by short_code (optional since UNIQUE already creates one)
CREATE INDEX idx_urls_short_code ON urls (short_code);

-- Index for existing URL checks via hash
CREATE INDEX idx_urls_url_hash ON urls (url_hash);
