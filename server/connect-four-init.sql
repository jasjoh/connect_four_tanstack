\echo 'Delete, recreate and seed connect-four (PROD) db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS connect_four;
CREATE DATABASE connect_four;
\connect connect_four;

\i connect-four-schema.sql
\i connect-four-seed.sql

\echo 'Delete and recreate connect-four-test (TEST) db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS connect_four_test;
CREATE DATABASE connect_four_test;
\connect connect_four_test;

\i connect-four-schema.sql