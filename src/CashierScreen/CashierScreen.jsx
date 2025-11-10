import React, { useActionState, useEffect, useState } from 'react';
import './CashierScreen.css';

function CashierScreen() {
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0);

    useEffect(()=>{ 
        fetch("http://127.0.0.1:5000/api/fetchProducts")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        return response.json();
        })
        .then(data => setProducts(data))
        .catch(error => console.error('Error fetching products:', error));
    },[]);

    const addItem = (name, price) => {
        const newItem = {
            name,
            price,
        };

        setOrderTotal(orderTotal+price);
        setItems([...items, newItem]);
    };

    const clear = () =>{
        setItems([]);
        setOrderTotal(0);
    };

    const checkout = () =>{
        setItems([]);
        setOrderTotal(0);
    };

    return (
    <div className="container">
        <div className="order">
            <ul>
            {products.map(p => (
                <li key={p.product_id}>
                {p.product_name} — ${p.unit_price}
                </li>
            ))}</ul>
            <button onClick={() => addItem("Tea", 20)} className='orderButton'>Test</button>
        </div>
        <div className="checkout">

        <ul className="orderItems">
            {items.map((item) => (
            <li key={item.id} className="orderItem">
                <span className="itemName">{item.name}</span>
                <span className="itemPrice"> ${item.price}</span>
            </li>
            ))}
        </ul>

        <p>${orderTotal}</p>
        <button onClick={clear} className='orderButton'>Cancel</button>
        <button onClick={checkout} className='orderButton'>Checkout</button>
        </div >
    </div>
);}

export default CashierScreen;
