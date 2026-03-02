import React from 'react'
import './DashBoard.css';
export const Budgetindicator = (props) => {
  const width=props.percentage+ "%";
  const st={
    width: width,
  
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.4s ease-in-out"
  }
  return (
   <>
    <h3 style={{color:"#f58a17"}}>Budget Usage</h3>
    <p style={{ color: "#333"}}>Your spending progress this month</p>
      <p>Spent: {props.percentage.toFixed(2)} % </p>
      <div className='indicator'>
    <div className="indicator1" style={st}>
       
    </div>
    </div>
   </>
  )
}
