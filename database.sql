UPDATE users SET hashed_password = '$2b$12$2geYgAhNzDaNJWoKqWVike1Jrg3T0NKF69I1YGMVZtagWOufn/Dam'
WHERE username IN ('admin', 'manager', 'client1', 'client2');