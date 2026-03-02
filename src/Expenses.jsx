
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Expense.css";
import { collection, onSnapshot, query, where, doc,updateDoc,deleteDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Expensecard } from "./ExpenseCard";
import { UserAuth } from "./UserAuth";
import { getMonthKey } from "./utils/Date";

export const Expenses = () => {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();
  const Change = async () => {
    await logout();
    navigate("/");
  };

  const USER_DOC_ID = user?.uid;
  const monthKey = getMonthKey();

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
 
  const [expensestotlist,setexpensestotlist]=useState([]);

const [sortKey, setSortKey] = useState("Feb");
useEffect(() => {
  if (!USER_DOC_ID) return; // make sure user ID exists

  // Reference to the user's expenses collection
  const expensesRef = collection(db, "users", USER_DOC_ID, "expenses");

  // Real-time listener
  const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
    const expensesList = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    setexpensestotlist(expensesList);
  });

  // Cleanup listener on unmount
  return () => unsubscribe();
}, [USER_DOC_ID]);
  // ---------------- FETCH EXPENSES FOR CURRENT MONTH ----------------
  useEffect(() => {
    if (!USER_DOC_ID) return;

    const expensesRef = collection(db, "users", USER_DOC_ID, "expenses");
    const q = query(expensesRef, where("month", "==", monthKey));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;

      const expensesList = snapshot.docs.map((doc) => {
        const data = doc.data();
        total += Number(data.amount || 0);

        return { id: doc.id, ...data };
      });

      const count = expensesList.length;
      const max = expensesList.reduce(
        (highest, item) => Math.max(highest, Number(item.amount || 0)),
        0
      );

      setExpenses(expensesList);
      setTotalAmount(total);
      setAverageAmount(count > 0 ? total / count : 0);
      setMaxAmount(max);
    });

    return () => unsubscribe();
  }, [USER_DOC_ID, monthKey]);
 console.log(expensestotlist);
  // ---------------- SEARCH FILTER ----------------
 // Get current month name
const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const currentMonth = monthOrder[new Date().getMonth()];
const handleEdit = async (expense) => {
  try {
    const newTitle = prompt("Enter new title", expense.title);
    const newAmount = prompt("Enter new amount", expense.amount);
    const newCategory = prompt("Enter new category", expense.category);
    const newDate = prompt(
      "Enter new date (YYYY-MM-DD)",
      expense.date?.toDate
        ? expense.date.toDate().toISOString().split("T")[0]
        : ""
    );

    if (!newTitle || !newAmount || !newCategory || !newDate) return;

    await updateDoc(
      doc(db, "users", USER_DOC_ID, "expenses", expense.id),
      {
        title: newTitle,
        amount: Number(newAmount),
        category: newCategory,
        date: new Date(newDate),
        month: getMonthKey(), // 🔥 VERY IMPORTANT
      }
    );

    alert("Updated successfully ✅");
  } catch (error) {
    console.error("Update error:", error);
  }
};
const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "users", USER_DOC_ID, "expenses", id));
    alert("Expense deleted successfully!");
  } catch (error) {
    console.error("Error deleting expense:", error);
  }
};
const filteredData = expensestotlist
  .filter((item) => {
    // Convert Firebase date or JS date to month string
    const itemMonth = item.date?.toDate
      ? monthOrder[item.date.toDate().getMonth()]
      : monthOrder[new Date(item.date).getMonth()];

    // 1️⃣ Filter by selected month if sortKey is set
    if (sortKey) {
      return itemMonth === sortKey;
    }

    // 2️⃣ Default: show current month
    if (!sortKey) {
      return itemMonth === currentMonth;
    }
    
    return false;
  })
  .filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    // Sort by date ascending
    const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
    const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
    return dateA - dateB;
  });
  const totalAmount = filteredData.reduce(
  (sum, item) => sum + Number(item.amount || 0),
  0
);

const averageAmount =
  filteredData.length > 0
    ? totalAmount / filteredData.length
    : 0;

const maxAmount = filteredData.reduce(
  (highest, item) =>
    Math.max(highest, Number(item.amount || 0)),
  0
);

  return (
    <>
      {/* ---------- HEADER ---------- */}
      <div className="header">
        <h3>EXPENSE TRACKER</h3>
        <div className="nav">
          <p>
            <Link
              to="/dashboard"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              className="link"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
          </p>
          <p>
            <Link
              to="/expenses"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              className="link"
            >
              <span className="material-symbols-outlined">checkbook</span>
              Expenses
            </Link>
          </p>
          <p>
            <Link
              to="/analysis"
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
              className="link"
            >
              <span className="material-symbols-outlined">finance_mode</span>
              Analytics
            </Link>
          </p>
        </div>
        <span
          className="material-symbols-outlined"
          style={{ paddingRight: "50px", cursor: "pointer", color: "#f97316" }}
          onClick={Change}
        >
          logout
        </span>
      </div>

      {/* ---------- SECTION ---------- */}
      <div className="seg1">
        <div>
          <h2>All Expenses</h2>
          <p>View and manage your expenses</p>
        </div>
      </div>

      {/* ---------- SEARCH ---------- */}
     <div className="seg" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div>
    <h3>Expenses</h3>
    <p style={{ color: "#333", fontSize: "16px" }}>
      List of your expenses
    </p>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <input
      type="text"
      style={{
        width: "200px",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #969696",
      }}
      placeholder="Search expenses..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <select
      value={sortKey}
      onChange={(e) => setSortKey(e.target.value)}
      style={{
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #969696",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      <option value="">Sort by Month</option>
      <option value="Jan">January</option>
      <option value="Feb">February</option>
      <option value="Mar">March</option>
      <option value="Apr">April</option>
      <option value="May">May</option>
      <option value="Jun">June</option>
      <option value="Jul">July</option>
      <option value="Aug">August</option>
      <option value="Sep">September</option>
      <option value="Oct">October</option>
      <option value="Nov">November</option>
      <option value="Dec">December</option>
    </select>
  </div>
</div>
      {/* ---------- EXPENSE TABLE ---------- */}
      <div className="expense-list">
        <div className="tablehead">
          <p style={{ paddingLeft: "10px" }}>Date</p>
          <p>Category</p>
          <p>Description</p>
          <p>Amount</p>
          <p>Action</p>
        </div>

       {filteredData.length === 0 ? (
  <p style={{ padding: "20px" }}>No expenses found</p>
) : (
  filteredData.map((expense) => (
    <div key={expense.id} className="expense-item">
      <p style={{ paddingLeft: "14px" }}>
        {expense.date?.toDate
          ? expense.date.toDate().toLocaleDateString()
          : expense.date
          ? new Date(expense.date).toLocaleDateString()
          : ""}
      </p>
      <p>{expense.category}</p>
      <p>{expense.title}</p>
      <p>₹ {expense.amount}</p>
      <p style={{ display: "flex", gap: "10px" }}>
  <span 
    style={{ cursor: "pointer", color: "#3b82f6" }}
    onClick={() => handleEdit(expense)}
  >
    ✏️
  </span>

  <span 
    style={{ cursor: "pointer", color: "#ef4444" }}
    onClick={() => handleDelete(expense.id)}
  >
    🗑️
  </span>
</p>
    </div>
  ))
)}
      </div>

      {/* ---------- FOOTER CARDS ---------- */}
      <div className="footer">
        <Expensecard name={"Total Expenses"} amt={totalAmount} />
        <Expensecard name={"Average"} amt={averageAmount.toFixed(2)} />
        <Expensecard name={"Highest Expense"} amt={maxAmount} />
      </div>
    
    </>
  );
};