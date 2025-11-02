from flask import Flask, jsonify, render_template, request, redirect, url_for
import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure database URI (fallback to SQLite if not set)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///test.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable overhead warnings

# Initialize SQLAlchemy
db = SQLAlchemy(app)


# -------------------- MODELS --------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Auto-increment by default
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(pytz.timezone("Asia/Kathmandu"))
    )

    def __repr__(self):
        return f"<User {self.username}>"


# -------------------- ROUTES --------------------

@app.route('/v2/status', methods=['GET'])
def status():
    """Simple health check endpoint."""
    return jsonify({"status": "ok"}), 200


@app.route('/', methods=['GET'])
def home():
    """Landing page."""
    return render_template('index.html')


@app.route('/userlist', methods=['GET', 'POST'])
def userlist():
    if request.method == 'POST':
        # Try to parse JSON; if not available, fall back to form data
        data = request.get_json(silent=True) or request.form
        
        username = data.get('username')
        email = data.get('email')
        content = data.get('content')

        # Validate required fields
        if not username or not email:
            return jsonify({"error": "Username and Email are required."}), 400

        new_user = User(username=username, email=email, content=content)

        try:
            db.session.add(new_user)
            db.session.commit()
            #return jsonify({"message": "User added successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400
        
        users = User.query.order_by(User.created_at).all()
        table_html = render_template('components/_userlist_table.html', userlist=users)
        return jsonify({"table_html": table_html,"message": "User added successfully"})

    else:
        userlist = User.query.order_by(User.created_at.asc()).all()
        return render_template('userlist.html', userlist=userlist)


@app.route('/delete_user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    """Delete a user by ID."""
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
        return redirect(url_for('userlist'))
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/update_user/<int:user_id>', methods=['GET', 'POST'])
def update_user(user_id):
    """Update user details. Handles both GET (show form) and POST (process update)."""
    user = User.query.get_or_404(user_id)

    if request.method == 'POST':
        data = request.get_json(silent=True) or request.form
        
        # Update user fields if provided in request
        if data.get('username'):
            user.username = data['username']
        if data.get('email'):
            user.email = data['email']
        user.content = data.get('content', user.content)

        try:
            db.session.commit()
            # Return refreshed table HTML for AJAX requests
            users = User.query.order_by(User.created_at.asc()).all()
            table_html = render_template('components/_userlist_table.html', userlist=users)
            return jsonify({"table_html": table_html, "message": "User updated successfully"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400
    else:
        # GET request - return the modal template with user data
        return render_template('components/update_user.html', user=user)
# -------------------- MAIN --------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables exist before running
    app.run(host='0.0.0.0',debug=True)
