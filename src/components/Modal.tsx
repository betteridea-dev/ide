import { useState } from 'react';
import { Link } from 'react-router-dom';

const AddModal = ({setAddModal}) => {
    const [newContract,setNewContract]=useState("");
    // to handle change in the input field
    const handleChange=(e)=>{
        const {value}=e.target;
        setNewContract(value);
    }
    // to handle submit of the contract 
    const handleSubmit=()=>{
        console.log("contract submitted",newContract);
        // logic to add new contract    
        setAddModal(false);    
    }
  return (
    <div className="fixed inset-0 z-10 bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
        <div className=' bg-[#24312F] p-3 rounded-[10px]'>
            <h1 className='font-bold text-xl bold text-center py-1 pb-4 mb-3'>Add Contract</h1>
            <form className='flex flex-col' onSubmit={handleSubmit}>
                <label className='flex gap-2 font-semibold'>
                    Name:
                    <input className=' bg-transparent border rounded font-normal' value={newContract} onChange={handleChange} type="text" name="name" required/>
                </label>
                <div className='flex items-center justify-center  w-full'>
                        <button type='submit' className='px-3 bg-gray-500 w-fit rounded mt-5 hover:scale-105 hover:bg-[#24A088] transition-all duration-300'>Create</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default AddModal;