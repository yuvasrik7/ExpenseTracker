import React from 'react'
import './DashBoard.css';
export const Dashcard = (props) => {
    let name=props.name;
    let amt=props.amt;
    let des=props.des;
  return (
    <>
    <div className="cardeach cardstyle" style={{...props.backc}}>
       <div className="card-icon"> <p style={props.style1}> {name}</p><p>{props.icon}</p></div>
        <h2 style={{...props.style2}}>{amt}</h2>
        <p >{des}</p>
    </div>
      

    </>
  )
}
