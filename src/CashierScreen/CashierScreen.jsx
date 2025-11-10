import React, { useActionState, useState } from 'react';
import './CashierScreen.css';

function CashierScreen() {
    const [items, setItems] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0);

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
