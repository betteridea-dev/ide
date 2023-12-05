import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contractSrc, stateSrc } from '../templates/hello';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AddModal = ({ setAddModal }: { setAddModal: any }) => {
    const [contractname, setNewContractName] = useState("");
    // to handle change in the input field
    const handleChange = (e) => {
        const { value } = e.target;
        setNewContractName(value);
    }
    // to handle submit of the contract 
    const handleSubmit = () => {
        console.log("contract submitted", contractname);

        const contracts = localStorage.getItem("contracts");
        if (!contracts) return;
        const parsed = JSON.parse(contracts);
        const keys = Object.keys(parsed);
        console.log(keys);
        if (keys.includes(contractname)) {
            alert("contract already exists");
            return;
        }
        parsed[contractname] = {
            "contract.js": contractSrc,
            "state.json": stateSrc,
        };
        localStorage.setItem("contracts", JSON.stringify(parsed));
        dispatchEvent(new Event("contractsUpdated"));

        setAddModal(false);
    }
    return (
        <div className="fixed inset-0 z-10 bg-[rgba(0,0,0,0.7)] flex items-center justify-center flex-col">
            <div className=' bg-[#24312F] p-3 rounded-[10px]'>
                <h1 className='font-bold text-xl bold text-center py-1 pb-4 mb-3'>Add Contract</h1>
                <form className='flex flex-col' onSubmit={handleSubmit}>
                    <label className='flex gap-2 font-semibold'>
                        Name:
                        <input className=' bg-transparent border rounded font-normal' value={contractname} onChange={handleChange} type="text" name="name" required />
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