import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from datetime import datetime
from decimal import Decimal
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    ForeignKey,
    PrimaryKeyConstraint,
    Enum as SAEnum,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://'+os.getenv("PSQL_USER")+':'+os.getenv("PSQL_PASSWORD")+'@'+os.getenv("PSQL_HOST")+":"+os.getenv("PSQL_PORT")+"/"+os.getenv("PSQL_DATABASE")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

Base = declarative_base()
EmployeeRole = SAEnum('Cashier', 'Manager', name='employee_role', native_enum=True)
ModificationType = SAEnum('ADD', 'REMOVE', 'LESS', 'EXTRA', name='modification_type', native_enum=True)

class Employee(Base):
    __tablename__ = 'employees'

    employee_id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    # "role" is a common identifier in SQL (Postgres has ROLE in role management),
    # but it's fine as a column name; SQLAlchemy will quote as needed for dialects.
    role = Column('role', EmployeeRole, nullable=False)

    orders = relationship('Order', back_populates='employee')


class Order(Base):
    __tablename__ = 'orders'

    order_id = Column(Integer, primary_key=True)
    order_date = Column(DateTime, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    employee_id = Column(Integer, ForeignKey('employees.employee_id'), nullable=False)

    employee = relationship('Employee', back_populates='orders')
    items = relationship('OrderItem', back_populates='order', cascade='all, delete-orphan')


class Product(Base):
    __tablename__ = 'products'

    product_id = Column(Integer, primary_key=True)
    product_name = Column(String, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    recipe = relationship('ProductRecipe', back_populates='product')
    order_items = relationship('OrderItem', back_populates='product')


class Inventory(Base):
    __tablename__ = 'inventory'

    ingredient_id = Column(Integer, primary_key=True)
    ingredient_name = Column(String, nullable=False)
    on_hand_quantity = Column(Numeric(10, 1), nullable=False)

    recipe_entries = relationship('ProductRecipe', back_populates='ingredient')
    modifications = relationship('Modification', back_populates='ingredient')


class ProductRecipe(Base):
    __tablename__ = 'product_recipe'

    product_id = Column(Integer, ForeignKey('products.product_id'), nullable=False)
    ingredient_id = Column(Integer, ForeignKey('inventory.ingredient_id'), nullable=False)
    quantity_per_unit = Column(Numeric(10, 1), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('product_id', 'ingredient_id', name='pk_product_recipe'),
    )

    product = relationship('Product', back_populates='recipe')
    ingredient = relationship('Inventory', back_populates='recipe_entries')


class OrderItem(Base):
    __tablename__ = 'order_items'

    order_item_id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey('orders.order_id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.product_id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price_at_sale = Column(Numeric(10, 2), nullable=False)

    order = relationship('Order', back_populates='items')
    product = relationship('Product', back_populates='order_items')
    modifications = relationship('Modification', back_populates='order_item', cascade='all, delete-orphan')


class Modification(Base):
    __tablename__ = 'modifications'

    modification_id = Column(Integer, primary_key=True)
    order_item_id = Column(Integer, ForeignKey('order_items.order_item_id'), nullable=False)
    ingredient_id = Column(Integer, ForeignKey('inventory.ingredient_id'), nullable=False)
    modification_type = Column(ModificationType, nullable=False)
    quantity_change = Column(Numeric(10, 1), nullable=True)
    price_change = Column(Numeric(10, 2), nullable=True)

    order_item = relationship('OrderItem', back_populates='modifications')
    ingredient = relationship('Inventory', back_populates='modifications')


@app.route('/api/fetchProducts', methods=['GET'])
def fetchProducts():
    result = db.session.execute(db.text("SELECT * FROM products"))
    rows = result.fetchall()

    products = [dict(row._mapping) for row in rows]
    return jsonify(products)

@app.route('/api/postOrder', methods=['POST'])
def post_order():
    data = request.get_json()
    try:
        session = db.session  

        new_order = Order(
            total_amount=Decimal(str(data['total_amount'])),
            employee_id=data['employee_id'],
            order_date=datetime.now()
        )
        session.add(new_order)
        session.flush()  

        for item_data in data['items']:
            item = OrderItem(
                order_id=new_order.order_id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                unit_price_at_sale=Decimal(str(item_data['unit_price_at_sale']))
            )
            session.add(item)
            session.flush()  

            for mod_data in item_data.get('modifications', []):
                mod = Modification(
                    order_item_id=item.order_item_id,
                    ingredient_id=mod_data['ingredient_id'],
                    modification_type=mod_data['modification_type'],
                    quantity_change=Decimal(str(mod_data.get('quantity_change', 0))),
                    price_change=Decimal(str(mod_data.get('price_change', 0)))
                )
                session.add(mod)

        session.flush()

        for item_data in data['items']:
            product = session.get(Product, item_data['product_id'])
            if not product:
                continue

            for recipe in product.recipe:
                total_qty = recipe.quantity_per_unit * Decimal(item_data['quantity'])

                for mod_data in item_data.get('modifications', []):
                    if mod_data['ingredient_id'] == recipe.ingredient_id:
                        total_qty += Decimal(mod_data['quantity_change']) * Decimal(item_data['quantity'])

                inv = session.get(Inventory, recipe.ingredient_id)
                if inv:
                    inv.on_hand_quantity -= total_qty

            for mod_data in item_data.get('modifications', []):
                inv = session.get(Inventory, mod_data['ingredient_id'])
                if inv:
                    mod_type = mod_data['modification_type'].upper()
                    qty_change = Decimal(mod_data['quantity_change']) * Decimal(item_data['quantity'])
                    if mod_type in ('ADD', 'EXTRA'):
                        inv.on_hand_quantity -= qty_change
                    elif mod_type in ('REMOVE', 'LESS'):
                        inv.on_hand_quantity += qty_change

        session.commit()

        return jsonify({
            "message": "Order posted successfully",
            "order_id": new_order.order_id
        }), 201

    except SQLAlchemyError as e:
        session.rollback()
        print("Error Adding Order", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)