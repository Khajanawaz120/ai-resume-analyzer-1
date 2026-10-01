import os

os.environ['DATABASE_URL'] = 'sqlite:///./test_auth.db'
os.environ['FLASK_SECRET_KEY'] = 'persistent-secret-key'

import app as app_module

with app_module.app.app_context():
    app_module.init_db()
    db = app_module.get_db()
    db.execute('DELETE FROM users WHERE email IN (?, ?)', ('test@example.com', 'second@example.com'))
    db.commit()

client = app_module.app.test_client()

resp = client.post('/signup', data={
    'name': 'Test User',
    'email': 'test@example.com',
    'password': 'TestPassword123!',
    'confirm_password': 'TestPassword123!'
}, follow_redirects=True)
print('signup', resp.status_code, b'Account created successfully' in resp.data)

resp = client.post('/login', data={
    'email': 'test@example.com',
    'password': 'TestPassword123!'
}, follow_redirects=True)
print('login', resp.status_code, b'/dashboard' in resp.data or b'Welcome back' in resp.data)

resp = client.get('/dashboard')
print('dashboard', resp.status_code, b'Test User' in resp.data)

resp = client.get('/logout')
print('logout', resp.status_code)

resp = client.post('/login', data={
    'email': 'test@example.com',
    'password': 'TestPassword123!'
}, follow_redirects=True)
print('login2', resp.status_code, resp.request.path == '/dashboard')

client.get('/logout')

resp = client.post('/signup', data={
    'name': 'Second User',
    'email': 'test@example.com',
    'password': 'AnotherPass123!',
    'confirm_password': 'AnotherPass123!'
}, follow_redirects=True)
print('duplicate', resp.status_code, b'already exists' in resp.data.lower())

resp = client.post('/login', data={
    'email': 'test@example.com',
    'password': 'wrongpassword'
}, follow_redirects=True)
print('wrongpw', resp.status_code, b'Invalid email or password' in resp.data)

resp = client.get('/style.css')
print('style', resp.status_code, resp.mimetype, len(resp.data))
