import TableSearch from "@/components/TableSearch";
import React from "react";
import Image from "next/image";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import Link from "next/link";
import {assignmentsData, examsData, lessonsData,resultsData,role} from "@/lib/data";
import FormModal from "@/components/FormModal";

type result = {
  id: number;
  subject:string;
  student:string
  class:string;
  teacher:string;
  date:string;
  score:string;
  type:string;
  
  
};

const columns = [
  {
    header: "Subject",
    accessor: "classes",
  }, 
 
  {
    header: "Student",
    accessor: "student",
    className: "hidden md:table-cell",
  },
  {
    header: "Score",
    accessor: "score",
    className: "hidden md:table-cell",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden sm:table-cell",
  },

  {
    header: "Date",
    accessor: "Date",
    className: "hidden md:table-cell",
  },

  {
    header: "Action",
    accessor: "action",
  },
];

const ResultListPage = () => {
  const renderRow = (item: result) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="flex items-center gap-4 p-4">{item.subject}</td>
      <td className="hidden sm:table-cell">{item.student}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td className="hidden md:table-cell">{item.class}</td>
      <td className="hidden md:table-cell">{item.date}</td>
      
      
      <td>
        <div className="flex items-center gap-2"> 
          {/* <Link href={`/list/teachers/${item.id}`}>
          <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
            <Image src="/view.png" alt="" width={16} height={16}/>
          </button>
          </Link> */}
          {role === "admin" && (
            <>
              <FormModal table={"parent"} type="update" data={item} />
              <FormModal table={"parent"} type={"delete"} id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4  w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
            // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
            //   <Image src="/plus.png" alt="" width={14} height={14} />
            // </button>
            <FormModal table={"result"} type={"create"}/>       
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={resultsData} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ResultListPage;
