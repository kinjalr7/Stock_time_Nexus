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
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE username = ?', (user.username,))
        db_user = cursor.fetchone()
        
        # If the user doesn't exist, automatically register them in Demo Mode
        if not db_user:
            hashed_password = pwd_context.hash(user.password)
            cursor.execute(
                'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                (user.username, hashed_password, f"{user.username}@nexus.app")
            )
            conn.commit()
            db_user = (hashed_password,)
        
        # If they exist but password doesn't match, auto-update password (frictionless demo)
        if not pwd_context.verify(user.password, db_user[0]):
            hashed_password = pwd_context.hash(user.password)
            cursor.execute(
                'UPDATE users SET password = ? WHERE username = ?',
                (hashed_password, user.username)
            )
            conn.commit()
            
        # Log the login event
        timestamp = datetime.datetime.utcnow().isoformat()
        ip = request.client.host if request.client else None
        cursor.execute(
            'INSERT INTO logins (username, timestamp, ip) VALUES (?, ?, ?)',
            (user.username, timestamp, ip)
        )
        conn.commit()
        return {"message": "Login successful"}
    finally:
        conn.close()

# Initialize database on startup
init_db()