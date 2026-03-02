
import React, { useEffect, useState } from "react";
import "./Expense.css";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { collection, doc, onSnapshot,getDoc, query, where } from "firebase/firestore";
import { Expensecard } from "./ExpenseCard";
import { db } from "./firebase";
import { UserAuth } from "./UserAuth";
import {
  Pie,
  PieChart,
  Legend,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { ensureMonthlyBudget, getMonthKey } from "./utils/Date";

export const Analysis = () => {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();
  const USER_DOC_ID = user?.uid;
  const monthKey = getMonthKey();

  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [averageAmount, setAverageAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [monthlySaving, setMonthlySaving] = useState(0);
  const [monthList, setMonthList] = useState([]);
   const [savingsList, setSavingsList] = useState([]);

  const COLORS = ["#f97316", "#fb923c", "#fdba74", "#ffedd5", "#ea580c"];

  const Change = async () => {
    await logout();
    navigate("/");
  };

  // ---------------- FETCH EXPENSES FOR CURRENT MONTH & BUDGET ----------------
 
useEffect(() => {
  if (!USER_DOC_ID) return;

  const expensesRef = collection(db, "users", USER_DOC_ID, "expenses");

  const unsubscribe = onSnapshot(expensesRef, (snapshot) => {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const totals = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!data.date) return;

      const jsDate =
        typeof data.date === "string"
          ? new Date(data.date)
          : data.date.toDate?.();

      if (!jsDate) return;

      // ✅ Only include current year
      if (jsDate.getFullYear() === currentYear) {
        const monthIndex = jsDate.getMonth();
        totals[monthIndex] += Number(data.amount || 0);
      }
    });

    // ✅ YOU FORGOT THIS PART
    const formatted = totals.map((value, index) => ({
      category: months[index],
      amount: value,
    }));

    setMonthList(formatted);
  });

  return () => unsubscribe();
}, [USER_DOC_ID]);
  // ---------------- BAR CHART DATA (monthly totals for year) ----------------
 // ✅ make sure this is imported

useEffect(() => {
  if (!USER_DOC_ID) return;

  const expensesRef = collection(db, "users", USER_DOC_ID, "expenses");

  const q = query(
    expensesRef,
    where("month", "==", monthKey)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
  const list = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 🔥 Exclude Investment like Dashboard
  const total = list
    .filter(item => item.category !== "Investment")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  setExpenses(list);
  setTotalAmount(total);

  const avg = list.length > 0 ? total / list.length : 0;
  setAverageAmount(avg);

  const maxVal = list.reduce(
    (highest, item) => Math.max(highest, Number(item.amount || 0)),
    0
  );

  setMaxAmount(maxVal);
});


  return () => unsubscribe();
}, [USER_DOC_ID, monthKey]);
useEffect(() => {
  if (!USER_DOC_ID) return;

  const fetchSavingsTrend = async () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const year = new Date().getFullYear();
    const savingsData = [];

    for (let m = 0; m < 12; m++) {
      const monthStr = String(m + 1).padStart(2, "0");
      const monthDocKey = `${year}-${monthStr}`;

      const monthDocRef = doc(
        db,
        "users",
        USER_DOC_ID,
        "monthlyBudget",
        monthDocKey
      );

      const snap = await getDoc(monthDocRef);

      if (snap.exists()) {
        const data = snap.data();
        savingsData.push({
          month: months[m],
          savings: Number(data?.savings || 0),
        });
      } else {
        savingsData.push({
          month: months[m],
          savings: 0,
        });
      }
    }

    setSavingsList(savingsData);
  };

  fetchSavingsTrend();
}, [USER_DOC_ID]);

useEffect(() => {
  if (!USER_DOC_ID) return;

  const budgetRef = doc(
    db,
    "users",
    USER_DOC_ID,
    "monthlyBudget",
    monthKey
  );

  const unsubscribe = onSnapshot(budgetRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();

      const budget = Number(data?.budget || 0);
      const savings = Number(data?.savings || 0);

      setMonthlyBudget(budget);
      setMonthlySaving(savings);

      // 🔥 Line chart uses SAME savings
      setSavingsList([
        {
          month: monthKey,
          savings: savings,
        },
      ]);
    } else {
      setMonthlyBudget(0);
      setMonthlySaving(0);
      setSavingsList([
        {
          month: monthKey,
          savings: 0,
        },
      ]);
    }
  });

  return () => unsubscribe();
}, [USER_DOC_ID, monthKey]);
  // ---------------- PIE CHART DATA ----------------
  const chartData = expenses.reduce((acc, item) => {
    if (!item.category) return acc;
    const existing = acc.find((obj) => obj.category === item.category);
    if (existing) existing.amount += Number(item.amount || 0);
    else acc.push({ category: item.category, amount: Number(item.amount || 0) });
    return acc;
  }, []);

  const percentage =
    monthlyBudget > 0 ? Math.floor((totalAmount / monthlyBudget) * 100) : 0;
 console.log("save"+savingsList);
  return (
    <>
      <div className="header">
        <h3>EXPENSE TRACKER</h3>
        <div className="nav">
          <p>
            <Link to="/dashboard" className="link" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
          </p>
          <p>
            <Link to="/expenses" className="link" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined">checkbook</span>
              Expenses
            </Link>
          </p>
          <p>
            <Link to="/analysis" className="link" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined">finance_mode</span>
              Analytics
            </Link>
          </p>
        </div>
        <span className="material-symbols-outlined" style={{ paddingRight: "50px", cursor: "pointer", color: "#f97316" }} onClick={Change}>
          logout
        </span>
      </div>

      <div className="seg1">
        <div>
          <h2>All Expenses</h2>
          <p>Do not save what is left after spending, but spend what is left after saving</p>
        </div>
      </div>

      <div className="footer">
        <Expensecard name="Total Used" amt={totalAmount} />
        <Expensecard name="Average" amt={averageAmount.toFixed(2)} />
        <Expensecard name="Budget Used" amt={percentage + "%"} />
        <Expensecard name="Savings" amt={monthlySaving} />
      </div>

      <div className="Charts">
        {/* PIE CHART */}
        <div>
          <PieChart width={400} height={300}>
            <Pie data={chartData} dataKey="amount" nameKey="category" outerRadius={90} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* BAR CHART */}
        <div>
          <h3 style={{ textAlign: "center" }}>2026</h3>
          {monthList.length > 0 && (
            <BarChart width={600} height={350} data={monthList}>
              <CartesianGrid strokeDasharray="8 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#f97316" />
            </BarChart>
          )}
        </div>
      </div>
      <p style={{textAlign:"center",fontWeight:"bold"}}>SAVINGS</p>
      <LineChart className="LineChart" width={900} height={300} data={savingsList}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Line
    type="monotone"   // 🔥 This makes it smooth like waves
    dataKey="savings" 
    stroke="#f7920e" 
    strokeWidth={3}
  />
</LineChart>
    </>
  );
};