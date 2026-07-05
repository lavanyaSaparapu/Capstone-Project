import sys
sys.path.append('.')
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()
user = db.query(User).filter(User.email == "meme@gmail.com").first()
if user:
    user.hashed_password = get_password_hash("meme123")
    db.commit()
    print("Password for meme@gmail.com reset to 'meme123'")
else:
    print("User meme@gmail.com not found")
db.close()
