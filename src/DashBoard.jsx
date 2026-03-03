import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { addDoc, collection, doc,getDoc,updateDoc,setDoc, query,where,onSnapshot } from "firebase/firestore";
import "./Dashboard.css";
import { Dashcard } from "./Dashcard";
import { Budgetindicator } from "./Budgetindicator";
import { FaDollarSign, FaWallet, FaChartLine } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { UserAuth } from "./UserAuth";
import { useNavigate } from "react-router-dom";
import getPreviousMonthKey, { ensureMonthlyBudget, getMonthKey } from "./utils/Date";
 import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const DashBoard = () => {
const { user, logout } = UserAuth();
const USER_DOC_ID = user?.uid;
const navigate = useNavigate();
 
const Change= async () => {
  await logout();
  navigate("/");
};
  // ✅ FIX 1: Make USER_DOC_ID state


  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [model, setModel] = useState(false);
  const [expenses, setexpenses] = useState([]);
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [countrec, setcountrec] = useState(0);
  const [description, setDescription] = useState("");
  const [monthChange,setMonthChange]=useState(false);
  // ✅ FIX 2: Correct Auth Listener
 
const monthKey = getMonthKey();
async function addExpenseHandler() {
  if (!USER_DOC_ID) return;

  try {
    const budgetRef = doc(
      db,
      "users",
      USER_DOC_ID,
      "monthlyBudget",
      monthKey
    );

    const budgetSnap = await getDoc(budgetRef);

    if (!budgetSnap.exists()) {
      alert("Set monthly budget first");
      return;
    }

    const budgetData = budgetSnap.data();

    // 🔴 If Investment → deduct from savings
    if (category === "Investment") {
      const currentSavings = budgetData.savings || 0;

      if (amount > currentSavings) {
        alert("Not enough savings for investment");
        return;
      }

      await updateDoc(budgetRef, {
        savings: currentSavings - amount,
      });
    }

    // ✅ Add expense normally
    const addRef = collection(db, "users", USER_DOC_ID, "expenses");

    await addDoc(addRef, {
      amount: Number(amount),
      category,
      date: new Date(date),
      title,
      description,
      month: monthKey,
    });

    // Reset fields
    setAmount(0);
    setCategory("");
    setTitle("");
    setDate("");
    setDescription("");
    setModel(false);

  } catch (error) {
    console.error("Error adding expense:", error);
  }
}
   

const exportToPDF = () => {
  const doc = new jsPDF();

  doc.text("Monthly Expense Report", 14, 15);

  const tableData = expenses.map((exp) => [
    exp.title,
    exp.category,
    exp.date?.toDate
      ? exp.date.toDate().toLocaleDateString()
      : new Date(exp.date).toLocaleDateString(),
    `$${exp.amount}`,
  ]);

  autoTable(doc, {
    head: [["Title", "Category", "Date", "Amount"]],
    body: tableData,
    startY: 20,
  });

  doc.save("Expense_Report.pdf");
};
useEffect(() => {
  if (!USER_DOC_ID) return;

  const checkBudget = async () => {
    const docRef = doc(db, "users", USER_DOC_ID, "monthlyBudget", monthKey);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      setMonthChange(true);
    } else {
      const data = snap.data();
      console.log("Budget data:", data);
      setMonthlyBudget(Number(data.budget) || 0);
    }
  };

  checkBudget();
}, [USER_DOC_ID, monthKey]);
console.log(monthKey);
useEffect(() => {
  if (!USER_DOC_ID) return;

  const q = query(
    collection(db, "users", USER_DOC_ID, "expenses"),
    where("month", "==", monthKey)
  );

  const unsub = onSnapshot(q, (snapshot) => {
    // 🔹 Create list from snapshot
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // 🔹 Calculate total (excluding Investment)
    const total = list
      .filter((item) => item.category !== "Investment")
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    // 🔹 Update state
    setTotalExpenses(total);
    setexpenses(list);
    setcountrec(list.length);
  });

  return () => unsub();
}, [USER_DOC_ID, monthKey]);
useEffect(() => {
  if (!user) return;

  const updateBudget = async () => {
    const ref = doc(
      db,
      "users",
      USER_DOC_ID,
      "monthlyBudget",
      monthKey
    );

    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    await updateDoc(ref, {
      totalSpent: totalExpenses,   // ✅ ONLY UPDATE THIS
    });
  };

  updateBudget();
}, [totalExpenses, user, monthKey]);

  console.log(USER_DOC_ID);
  const remainingBalance = monthlyBudget - totalExpenses;

 const percentage =
  monthlyBudget > 0
    ? Math.min(Math.floor((totalExpenses / monthlyBudget) * 100), 100)
    : 0;
    console.log("percentage"+percentage);
  const head = {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "15px",
  };

  const back = {
    background: "#fff7ed"
  }

  const remstyle = {
    color: remainingBalance >= 0 ? "green" : "red",
    fontWeight: 700
  };

  const addExpense = () => {
    setModel(true);
  }
  

  return (
    <>
      
   {monthChange && (
    <div className="divbudget">
  <div className="budgetModal">
    <h2>Enter Monthly Budget</h2>

    <input
      type="number"
    
      onChange={(e) => setMonthlyBudget(Number(e.target.value))}
    />

    <button
 onClick={async () => {
      if (monthlyBudget <= 0) {
    alert("Enter valid budget");
    return;
  }

  const prevMonthKey = getPreviousMonthKey(monthKey);
 console.log(prevMonthKey);
  const prevRef = doc(
    db,
    "users",
    USER_DOC_ID,
    "monthlyBudget",
    prevMonthKey
  );

  const prevSnap = await getDoc(prevRef);

  let newSavings = 0;

  if (prevSnap.exists()) {
    const prevData = prevSnap.data();

    const prevSavings = prevData.savings || 0;

    const prevRemaining =
      (prevData.budget || 0) - (prevData.totalSpent || 0);

    newSavings = prevSavings + prevRemaining;
 
  }

  await setDoc(
    doc(db, "users", USER_DOC_ID, "monthlyBudget", monthKey),
    {
      budget: monthlyBudget,
      totalSpent: 0,
      savings: newSavings, 
    }
  );
 console.log(newSavings);
  setMonthChange(false);
}}
>
  Save
</button>
    <button onClick={()=>{setMonthChange(false)}}>Close</button>
  </div>
  </div>
)}
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
            <Link to="/expenses" style={{ display: "flex", alignItems: "center", gap: "6px" }} className="link">
              <span className="material-symbols-outlined">checkbook</span>
              Expenses
            </Link>
          </p>

          <p>
            <Link to="/analysis" style={{ display: "flex", alignItems: "center", gap: "6px" }} className="link">
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
        <div className="seg1">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: "#333", fontSize: "15px" }}>
            Overview of your expenses
          </p>
        </div>
        <p className="addexpense" onClick={addExpense}>+ Add Expense</p>
        <button className="export" onClick={exportToPDF}>
  Export PDF
</button>
      </div>

      <div className="cards">
        <Dashcard 
          name="Total Expenses"
          amt={`$ ${totalExpenses}`}
          des="This month"
          style1={head}
          backc={back}
           icon={<FaDollarSign className=" icons" size={18} color="red" />}
        />

        <Dashcard 
          name="Monthly Budget"
          amt={`$ ${monthlyBudget}`}
          des="Set for this Month"
          style1={head}
          backc={back}
           icon={<FaWallet className=" icons" size={18} color="blue" />}
        />

        <Dashcard 
          name="Remaining Balance"
          amt={`$ ${remainingBalance}`}
          des="Available"
          style1={head}
          style2={remstyle}
          backc={back}
           icon={<FaChartLine className=" icons" size={18} color="green" />}
        />
      </div>

      <div className="budgetindicator">
        <Budgetindicator
          totalexpenses={totalExpenses}
          percentage={percentage}
        />
      </div>
     {model && (
  <div className="modalOverlay">
    <div className="modalBox">
      <h2>Add Expense</h2>
      <label> Amount </label>
       <input id="amt"
        type="number"
        placeholder="Amount" onChange={(e)=>setAmount(Number(e.target.value))}
      />
       <label>Title</label>
      <input
        type="text" id="des"
        placeholder="Enter expense details" onChange={(e)=>setTitle(e.target.value)}
      />
     <label>Category</label>
      <select
  id="cat"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select Category</option>
  <option value="Food">Food</option>
  <option value="Medicine">Medicine</option>
  <option value="Education">Education</option>
  <option value="Travel">Travel</option>
  <option value="Insurance">Insurance</option>
  <option value="Investment">Investment</option>
</select>
      <label>Description</label>
      <input type="text" id="des"
      placeholder="what made you to spend on this..." onChange={((e)=>{setDescription(e.target.value)})}/>
      <label>Date</label>
     <input
  id="date"
  type="date"
  max={new Date().toISOString().split("T")[0]}
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>

     
      <button onClick={()=>{
        console.log(amount);
        console.log(category+title+date);
        if(!amount || !category || !title || !date){
          alert("Please fill all fields");
          return;
        }
      addExpenseHandler()}}>Add</button>

      <button onClick={() => setModel(false)}>
        Cancel
      </button>
    </div>
  </div>
)}

      <div className="recentexpenses">
        <h3 style={{color:"#f58a17"}}>Recent Expenses</h3>
        <p style={{color: "#333"}}>Your latest {countrec} expenses</p>
          {expenses.map((expense)=>(
  <div key={expense.id} className="expenseItem">
              <div className="item1">
               <p style={{fontWeight:700,fontSize:"16px"}}>{expense.title}</p>
               <div className="item11">
                <p style={{background:"#ffebd5",padding:"5px",color:"#f58a17",borderRadius:"5px" ,fontWeight:500,textAlign:"center"}}>{expense.category}</p>
               <p style={{color:"#555"}}>{expense.date?.toDate
  ? expense.date.toDate().toLocaleDateString()
  : new Date(expense.date).toLocaleDateString()}</p>
               </div>
              </div>
              <div className="item2">
                <p style={{fontWeight:700,color:"red"}}>-${expense.amount}</p>
             
            </div>
            </div>
           ))}
      </div>
      

    </>
    
  );
}; 
     

 