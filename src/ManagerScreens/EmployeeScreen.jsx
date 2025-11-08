import React, { useState } from "react";
import "./EmployeeScreen.css";

function EmployeeScreen({ onBack }) {
  // Temporary placeholder employee data
  const [employees, setEmployees] = useState([
    { id: 1, name: "Alice Johnson", role: "Cashier" },
    { id: 2, name: "Bob Smith", role: "Cook" },
    { id: 3, name: "Carlos Ramirez", role: "Shift Manager" }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleHire = () => {
    alert("Hire screen will be implemented later.");
  };

  const handleFire = () => {
    if (!selectedEmployee) return alert("Please select an employee to fire.");
    alert(`Firing ${selectedEmployee.name} (ID: ${selectedEmployee.id})...`);
  };

  const handleRefresh = () => {
    alert("Refresh will reload data from API later.");
  };

  return (
    <div className="employee-container">
      <h1>Employees</h1>

      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className={selectedEmployee?.id === emp.id ? "selected" : ""}
              onClick={() => setSelectedEmployee(emp)}
            >
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="btn-row">
        <button onClick={onBack}>Back</button>
        <button onClick={handleRefresh}>Refresh</button>
        <button onClick={handleHire}>Hire</button>
        <button onClick={handleFire}>Fire</button>
      </div>
    </div>
  );
}

export default EmployeeScreen;
