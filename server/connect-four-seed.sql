\connect connect_four;

/** Creates a normal user with password of 'password' */
INSERT INTO users (id, username, password, email, is_admin)
VALUES
    (
        '976d455b-2a3b-47ce-82d8-e4ea2fb10a5e',
        'normaluser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'normal_email@foo.com',
        FALSE
    );

-- /** Creates an admin user with a password of 'password' */
-- INSERT INTO users (id, username, password, email, is_admin)
-- VALUES
--     (
--         '0d995e9d-33b4-4a88-85a1-960fc72d8eaf',
--         'adminuser',
--         '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
--         'admin_email@foo.com',
--         TRUE
--     );