-- ============================================
-- CAMPUSQUERY DATABASE SCHEMA
-- Optimized with indexes for better performance
-- ============================================

-- Updated to match optimized schema with proper indexes
-- Create students_auth table (Protected - Only for authentication)
CREATE TABLE IF NOT EXISTS students_auth (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students_auth(email);

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
  query_id SERIAL PRIMARY KEY,
  section VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  anonymous_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  student_id INTEGER REFERENCES students_auth(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_queries_section ON queries(section);
CREATE INDEX IF NOT EXISTS idx_queries_created ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_student ON queries(student_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  comment_id SERIAL PRIMARY KEY,
  query_id INTEGER REFERENCES queries(query_id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  anonymous_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  student_id INTEGER REFERENCES students_auth(id) ON DELETE CASCADE
);

-- Indexes for faster comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_query ON comments(query_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at ASC);

-- Added verification queries to check tables and indexes
-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables exist
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('students_auth', 'queries', 'comments');

-- Check indexes
-- SELECT indexname 
-- FROM pg_indexes 
-- WHERE tablename IN ('students_auth', 'queries', 'comments');
