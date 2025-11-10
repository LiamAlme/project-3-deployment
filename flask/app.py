import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://'+os.getenv("PSQL_USER")+':'+os.getenv("PSQL_PASSWORD")+'@'+os.getenv("PSQL_HOST")+":"+os.getenv("PSQL_PORT")+"/"+os.getenv("PSQL_DATABASE")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route('/api/fetchProducts')
def greeting():
    result = db.session.execute(db.text("SELECT * FROM products"))
    rows = result.fetchall()

    products = [dict(row._mapping) for row in rows]
    return jsonify(products)


if __name__ == '__main__':
    app.run(debug=True)