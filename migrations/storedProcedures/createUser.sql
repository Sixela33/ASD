CREATE OR REPLACE FUNCTION createUser(
    p_username VARCHAR(255),
    p_email VARCHAR(255),
    p_passhash VARCHAR(255)
)
RETURNS VOID AS $$
DECLARE
    new_user_id INT;
BEGIN
    -- Insertar nuevo usuario en la tabla users
    INSERT INTO users (username, email, passhash)
    VALUES (p_username, p_email, p_passhash)
    RETURNING userID INTO new_user_id;

    -- Asignar el rol 'User' al nuevo usuario en la tabla roleXuser
    INSERT INTO roleXuser (userID, roleID)
    VALUES (new_user_id, (SELECT roleID FROM userRole WHERE roleName = 'User'));
END;
$$ LANGUAGE plpgsql;
