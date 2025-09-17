from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from flask_cors import CORS
import os
import logging
from datetime import datetime, timedelta, timezone

# ----------------------------
# App + Config
# ----------------------------
app = Flask(__name__)
api = Api(app)
CORS(app)  # allow cross-origin requests for frontend use

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-change-me')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

# Database config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Logging
logging.basicConfig(level=logging.INFO)

# ----------------------------
# Models
# ----------------------------
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)  # JWT ID
    type = db.Column(db.String(10), nullable=False)  # 'access' or 'refresh'
    created_at = db.Column(db.DateTime, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # hashed
    role = db.Column(db.String(20), nullable=False, default='user')  # 'user' or 'admin'

    drugs = db.relationship('Drug', backref='owner', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'username': self.username, 'role': self.role}

class Drug(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    min_threshold = db.Column(db.Integer, nullable=False, default=10)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'min_threshold': self.min_threshold,
            'low_stock': self.quantity < self.min_threshold,
            'owner': self.owner.username if self.owner else None
        }

# ----------------------------
# JWT Blocklist handling
# ----------------------------
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    token = TokenBlocklist.query.filter_by(jti=jti).first()
    return token is not None  # revoked if present

# ----------------------------
# Helper functions
# ----------------------------
def get_json_data_or_400():
    data = request.get_json()
    if not data:
        return None, ({'message': 'JSON body required.'}, 400)
    return data, None

# ----------------------------
# Auth Resources
# ----------------------------
class Register(Resource):
    def post(self):
        data, err = get_json_data_or_400()
        if err:
            return err

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {'message': 'username and password are required.'}, 400

        if User.query.filter_by(username=username).first():
            return {'message': 'Username already exists.'}, 400

        hashed = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, password=hashed)
        db.session.add(user)
        db.session.commit()

        return {'message': 'User registered successfully.', 'user': user.to_dict()}, 201

class Login(Resource):
    def post(self):
        data, err = get_json_data_or_400()
        if err:
            return err

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {'message': 'username and password are required.'}, 400

        user = User.query.filter_by(username=username).first()
        if not user or not bcrypt.check_password_hash(user.password, password):
            return {'message': 'Invalid credentials.'}, 401

        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        return {'access_token': access_token, 'refresh_token': refresh_token, 'user': user.to_dict()}, 200

class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=current_user_id)
        return {'access_token': access_token}, 200

class LogoutAccess(Resource):
    @jwt_required()
    def post(self):
        jti = get_jwt()['jti']
        now = datetime.now(timezone.utc)
        db.session.add(TokenBlocklist(jti=jti, type='access', created_at=now))
        db.session.commit()
        return {'message': 'Access token revoked'}, 200

class LogoutRefresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        jti = get_jwt()['jti']
        now = datetime.now(timezone.utc)
        db.session.add(TokenBlocklist(jti=jti, type='refresh', created_at=now))
        db.session.commit()
        return {'message': 'Refresh token revoked'}, 200

class Me(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get_or_404(current_user_id)
        return user.to_dict(), 200

# ----------------------------
# Drug Resources
# ----------------------------
class DrugList(Resource):
    def get(self):
        drugs = Drug.query.all()
        return [drug.to_dict() for drug in drugs], 200

    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        data, err = get_json_data_or_400()
        if err:
            return err

        name = data.get('name')
        quantity = data.get('quantity', 0)
        min_threshold = data.get('min_threshold', 10)

        if not name:
            return {'message': 'Drug name is required.'}, 400

        # Optional duplicate check per user
        existing = Drug.query.filter_by(name=name, user_id=current_user_id).first()
        if existing:
            return {'message': 'You already have a drug with that name.'}, 400

        new_drug = Drug(name=name, quantity=quantity, min_threshold=min_threshold, user_id=current_user_id)
        db.session.add(new_drug)
        db.session.commit()

        return {'message': 'Drug added successfully.', 'drug': new_drug.to_dict()}, 201

class DrugItem(Resource):
    def get(self, drug_id):
        drug = Drug.query.get_or_404(drug_id)
        return drug.to_dict(), 200

    @jwt_required()
    def put(self, drug_id):
        current_user_id = get_jwt_identity()
        drug = Drug.query.get_or_404(drug_id)

        # allow admin or owner
        user = User.query.get(current_user_id)
        if drug.user_id != current_user_id and user.role != 'admin':
            return {'message': 'Unauthorized. Only the owner or admin can update this drug.'}, 403

        data, err = get_json_data_or_400()
        if err:
            return err

        drug.name = data.get('name', drug.name)
        drug.quantity = data.get('quantity', drug.quantity)
        drug.min_threshold = data.get('min_threshold', drug.min_threshold)

        db.session.commit()
        return {'message': 'Drug updated.', 'drug': drug.to_dict()}, 200

    @jwt_required()
    def delete(self, drug_id):
        current_user_id = get_jwt_identity()
        drug = Drug.query.get_or_404(drug_id)

        user = User.query.get(current_user_id)
        if drug.user_id != current_user_id and user.role != 'admin':
            return {'message': 'Unauthorized. Only the owner or admin can delete this drug.'}, 403

        db.session.delete(drug)
        db.session.commit()
        return {'message': 'Drug deleted.'}, 200

class LowStockDrugs(Resource):
    def get(self):
        low_stock = Drug.query.filter(Drug.quantity < Drug.min_threshold).all()
        return [drug.to_dict() for drug in low_stock], 200

class SearchDrug(Resource):
    def get(self):
        name_query = request.args.get('q', '')
        results = Drug.query.filter(Drug.name.ilike(f'%{name_query}%')).all()
        return [drug.to_dict() for drug in results], 200

class MyDrugs(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        drugs = Drug.query.filter_by(user_id=current_user_id).all()
        return [drug.to_dict() for drug in drugs], 200

# ----------------------------
# Admin utilities (optional endpoints)
# ----------------------------
class PromoteUser(Resource):
    @jwt_required()
    def post(self, user_id):
        # Only admin can promote
        current_user_id = get_jwt_identity()
        admin_user = User.query.get_or_404(current_user_id)
        if admin_user.role != 'admin':
            return {'message': 'Admin privileges required.'}, 403

        target = User.query.get_or_404(user_id)
        target.role = 'admin'
        db.session.commit()
        return {'message': f'User {target.username} promoted to admin.'}, 200

# ----------------------------
# Register routes
# ----------------------------
api.add_resource(Register, '/auth/register')
api.add_resource(Login, '/auth/login')
api.add_resource(Refresh, '/auth/refresh')
api.add_resource(LogoutAccess, '/auth/logout/access')
api.add_resource(LogoutRefresh, '/auth/logout/refresh')
api.add_resource(Me, '/auth/me')

api.add_resource(DrugList, '/drugs')
api.add_resource(DrugItem, '/drugs/<int:drug_id>')
api.add_resource(LowStockDrugs, '/drugs/low_stock')
api.add_resource(SearchDrug, '/drugs/search')
api.add_resource(MyDrugs, '/drugs/mine')

api.add_resource(PromoteUser, '/admin/promote/<int:user_id>')

# ----------------------------
# Main
# ----------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if User.query.count() == 0:
            pw = bcrypt.generate_password_hash('password').decode('utf-8')
            demo = User(username='demo', password=pw, role='user')
            admin = User(username='admin', password=pw, role='admin')
            db.session.add_all([demo, admin])
            db.session.commit()
            logging.info('Created demo user -> username: demo, password: password')
            logging.info('Created admin user -> username: admin, password: password')

    app.run(debug=True)
