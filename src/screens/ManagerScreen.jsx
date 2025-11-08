import React from "react";
import { useState } from "react";
import "./ManagerScreen.css";
import EmployeeScreen from "./EmployeeScreen";

function ManagerScreen() {
  const [showEmployeeScreen, setShowEmployeeScreen] = useState(false);
  if (showEmployeeScreen) {
    return <EmployeeScreen onBack={() => setShowEmployeeScreen(false)} />;
  }

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

        <button className="manager-btn" onClick={() => setShowEmployeeScreen(true)}>
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
