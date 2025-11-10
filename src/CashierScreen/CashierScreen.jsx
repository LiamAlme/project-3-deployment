import React, { useActionState, useEffect, useState } from 'react';
import './CashierScreen.css';

function CashierScreen() {
    const [products, setProducts] = useState([]);
    const [items, setItems] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0);

    const [orderData, setOrderData] = useState({
        total_amount: 0,
        employee_id: 4,
        items: []
    });

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

    const addItem = (name, price, id) => {
        const newItem = {
            name,
            price,
        };

        setOrderTotal(orderTotal+price);
        setItems([...items, newItem]);

        setOrderData(prev => ({
            ...prev,
            total_amount: prev.total_amount + price,
            items: [...prev.items, {
                product_id: id,
                quantity: 1,
                unit_price_at_sale: price,
                modifications:[]
                }]
            }));

        orderData.items.push()
    };

    const clear = () =>{
        setItems([]);
        setOrderTotal(0);
    };

    const checkout = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://127.0.0.1:5000/api/postOrder", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            setItems([]);
            setOrderTotal(0);
        } 

        catch (error) {
            console.error("Error posting order:", error);
        }
    };

    return (
    <div className="container">
        <div className="order">
            <ul>
            {products.map(p => (
                <button onClick={() => addItem(p.product_name, parseFloat(p.unit_price), p.product_id)} key={p.product_id} className='orderButton'>
                {p.product_name} — ${p.unit_price}
                </button>
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
