import React from "react";
import "./ManagerScreen.css";

function ManagerScreen() {
  return (
    <div className="manager-container">
      <h1 className="manager-title">Manager Dashboard</h1>

      <div className="button-grid">
        <button className="manager-btn" onClick={() => console.log("Manage Menu Clicked")}>
          Manage Menu Items & Prices
        </button>

        <button className="manager-btn" onClick={() => console.log("Manage Inventory Clicked")}>
          Manage Inventory
        </button>

        <button className="manager-btn" onClick={() => console.log("Manage Employees Clicked")}>
          Manage Employees
        </button>

        <button className="manager-btn" onClick={() => console.log("View/Create Reports Clicked")}>
          View / Create Reports
        </button>
      </div>
    </div>
  );
}

export default ManagerScreen;
