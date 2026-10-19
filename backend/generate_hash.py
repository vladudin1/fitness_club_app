import bcrypt

password = b"secret"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print(f"Хэш пароля 'secret': {hashed.decode()}")