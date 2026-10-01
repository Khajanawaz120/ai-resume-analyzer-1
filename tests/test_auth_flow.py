import os

import app as app_module


def test_database_url_config_and_session_secret_are_environment_driven():
    os.environ['DATABASE_URL'] = 'sqlite:///./test_auth.db'
    os.environ['FLASK_SECRET_KEY'] = 'persistent-secret-key'
    app_module.refresh_app_security_config()

    assert app_module.get_database_url() == 'sqlite:///./test_auth.db'
    assert app_module.app.secret_key == 'persistent-secret-key'


def test_sign_up_and_login_work_with_secure_hashing_and_unique_email():
    os.environ['DATABASE_URL'] = 'sqlite:///./test_auth.db'
    os.environ['FLASK_SECRET_KEY'] = 'persistent-secret-key'
    app_module.refresh_app_security_config()

    with app_module.app.app_context():
        app_module.init_db()
        db = app_module.get_db()
        db.execute('DELETE FROM users WHERE email IN (?, ?)', ('test@example.com', 'second@example.com'))
        db.commit()

    client = app_module.app.test_client()

    response = client.post('/signup', data={
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'TestPassword123!',
        'confirm_password': 'TestPassword123!'
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b'Account created successfully' in response.data

    response = client.post('/signup', data={
        'name': 'Second User',
        'email': 'test@example.com',
        'password': 'AnotherPass123!',
        'confirm_password': 'AnotherPass123!'
    }, follow_redirects=True)
    assert b'already exists' in response.data.lower()

    response = client.post('/login', data={
        'email': 'test@example.com',
        'password': 'TestPassword123!'
    }, follow_redirects=True)
    assert response.status_code == 200
    assert '/dashboard' in response.request.path or b'Welcome back' in response.data

    response = client.get('/dashboard')
    assert response.status_code == 200
    assert b'Test User' in response.data

    response = client.get('/logout')
    assert response.status_code == 302

    response = client.post('/login', data={
        'email': 'test@example.com',
        'password': 'wrongpassword'
    }, follow_redirects=True)
    assert b'Invalid email or password' in response.data
