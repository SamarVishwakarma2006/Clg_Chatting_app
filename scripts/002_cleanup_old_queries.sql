-- Auto-delete queries older than 7 days
-- This script should be run as a scheduled task/cron job

DELETE FROM queries 
WHERE created_at < NOW() - INTERVAL '7 days';

-- Return the number of deleted queries
SELECT COUNT(*) as deleted_count 
FROM queries 
WHERE created_at < NOW() - INTERVAL '7 days';
