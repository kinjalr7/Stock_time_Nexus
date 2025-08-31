from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from passlib.context import CryptContext
import sqlite3
import os
import datetime

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    username: str
    password: str
    email: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str

# Database setup
def init_db():
    if not os.path.exists('users.db'):
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE
            )
        ''')
        # Create logins table for login events
        cursor.execute('''
            CREATE TABLE logins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                ip TEXT
            )
        ''')
        conn.commit()
        conn.close()
    else:
        # Ensure logins table exists even if users.db already exists
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS logins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                ip TEXT
            )
        ''')
        conn.commit()
        conn.close()

@router.post("/register")
async def register(user: UserCreate):
    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    hashed_password = pwd_context.hash(user.password)
    
    try:
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            (user.username, hashed_password, user.email)
        )
        conn.commit()
        return {"message": "User created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    finally:
        conn.close()

@router.post("/login")
async def login(user: UserLogin, request: Request):
    if not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT password FROM users WHERE username = ?', (user.username,))
    db_user = cursor.fetchone()
    conn.close()
    
    if db_user and pwd_context.verify(user.password, db_user[0]):
        # Log the login event
        timestamp = datetime.datetime.utcnow().isoformat()
        ip = request.client.host if request.client else None
        cursor.execute(
            'INSERT INTO logins (username, timestamp, ip) VALUES (?, ?, ?)',
            (user.username, timestamp, ip)
        )
        conn.commit()
        conn.close()
        return {"message": "Login successful"}
    else:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Initialize database on startup
init_db()