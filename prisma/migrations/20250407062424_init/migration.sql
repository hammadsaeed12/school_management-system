-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "img" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "studentId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
