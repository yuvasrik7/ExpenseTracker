import React from 'react'

export const Expensecard = (props) => {
    let name=props.name;
    let amt=props.amt;
  
  return (
    <>
    <div className='cardstyle' style={{backgroundColor:" #fff7ed",padding:"10px"}}>
       <div className="card-icon" style={{color:"#fc8d07",fontWeight:"550"}}> <p > {name}</p></div>
        <h2 >{amt}</h2>
       
    </div>
      

    </>
  )
}
