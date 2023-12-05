import React, { useState } from 'react';

const AddModal = () => {
    const [contract,setContract]=useState("");
    // to handle change in the input field
    const handleChange=(e)=>{
        const {value}=e.target;
        setContract(value);
    }
    // to handle submit of the contract 
    const handleSubmit=()=>{
        console.log("contract submitted",contract);
    }
  return (
    <div className="fixed inset-0 z-10 bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
        <div>
            <h1 className=' bold text-center'>Add Contract</h1>
            <form className='flex flex-col' onSubmit={handleSubmit}>
                <label className='flex gap-2'>
                    Name:
                    <input className=' text-black' value={contract} onChange={handleChange} type="text" name="name" />
                </label>
                <button>Create Contract</button>
            </form>
        </div>
    </div>
  )
}

export default AddModal;