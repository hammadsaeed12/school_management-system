import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ParentList = Parent & { 
  students: (Student & { 
    class?: { name: string } 
  })[];
  studentDetails?: {
    id: string;
    fullName: string;
    className: string;
  }[];
};

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
;
const { sessionClaims } =await auth(headers());
const role = (sessionClaims?.metadata as { role?: string })?.role;


const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Names",
    accessor: "students",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  ...(role === "admin"
    ? [
        {
          header: "Actions",
          accessor: "action",
        },
      ]
    : []),
];

const renderRow = (item: ParentList) => (
  <tr
    key={item.id}
    className="text-sm border-b border-gray-200 even:bg-slate-50 hover:bg-lamaPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.name} {item.surname}</h3>
        <p className="text-xs text-gray-500">{item?.email}</p>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.studentDetails && item.studentDetails.length > 0 ? (
        <div className="flex flex-col gap-1">
          {item.studentDetails.map(student => (
            <div key={student.id} className="text-sm">
              <span className="font-medium">{student.fullName}</span>
              <span className="ml-2 text-xs text-gray-500">({student.className})</span>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-sm text-gray-500">No students</span>
      )}
    </td>
    <td className="hidden md:table-cell">{item.phone}</td>
    <td className="hidden md:table-cell">{item.address}</td>
    <td>
      <div className="flex items-center gap-2">
        {role === "admin" && (
          <>
            <FormContainer table="parent" type="update" data={item} />
            <FormContainer table="parent" type="delete" id={item.id} />
          </>
        )}
      </div>
    </td>
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.ParentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    // Fetch parents with a more direct approach
    const data = await prisma.parent.findMany({
      where: query,
      include: {
        students: {
          select: {
            id: true,
            name: true,
            surname: true,
            classId: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    });

    // Format the data to include student details
    const formattedData = data.map(parent => ({
      ...parent,
      studentDetails: parent.students.map(student => ({
        id: student.id,
        fullName: `${student.name} ${student.surname}`,
        className: student.class?.name || 'No Class',
      })),
    }));

    const count = await prisma.parent.count({ where: query });

    return (
      <div className="flex-1 p-4 m-4 mt-4 bg-white rounded-md">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden text-lg font-semibold md:block">All Parents</h1>
          <div className="flex flex-col items-center w-full gap-4 md:flex-row md:w-auto">
            <TableSearch />
            <div className="flex items-center self-end gap-4">
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="" width={14} height={14} />
              </button>
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="" width={14} height={14} />
              </button>
              {role === "admin" && <FormContainer table="parent" type="create" />}
            </div>
          </div>
        </div>
        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={formattedData} />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching parents:", error);
    return (
      <div className="flex-1 p-4 m-4 mt-0 bg-white rounded-md">
        <h1 className="text-lg font-semibold text-red-500">Error loading parents</h1>
        <p>There was an error loading the parent list. Please try again later.</p>
      </div>
    );
  }
};

export default ParentListPage;
