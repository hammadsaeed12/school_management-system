import React from 'react'

const Pagination = () => {
  return (
    <div className='p-4 flex items-center justify-between text-gray-500'>
        <button disabled className='py-2 px-4 roundend-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed'>Prev</button>
        <button  className='py-2 px-4 roundend-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed'>Prev</button>
    </div>
  )
}

export default Pagination