import AttenndanceChart from '@/components/AttenndanceChart'
import CountCharts from '@/components/CountCharts'
import UserCard from '@/components/UserCard'
import React from 'react'

export default function AdminPage() {
  return (
    <div className='p-4 flex gap-4 flex-col md:flex-row'>
      {/* LEFT */}
      <div className='w-full lg:w-2/3 flex flex-col gap-8'>
      {/* USER CARD */}
      <div className='flex gap-4 justify-between flex-wrap'>
        <UserCard type='student'/>
        <UserCard type='teacher'/>
        <UserCard type='parent'/>
        <UserCard type='staff'/>
        </div>
        {/* MIDDLE CHARTS */}
        <div className='flex gap-4 flex-col lg:flex-row'>
          {/* COUNT CHART */}
          <div className='w-full lg:w-1/3 h-[450px]'>
          <CountCharts/>
          </div>
          {/* ATTENDANCE CHART */}
          <div className='w-full lg:w-2/3 h-[450px]'><AttenndanceChart/></div>
        </div>
        {/* BOTTOM CHARTS */}
        <div className='w-full h-[500px]'></div>
      </div>
      {/* RIGHT */}
      <div className='w-full lg:w-1/3'>R</div>
      </div>
  )
}
