/*
  Warnings:

  - You are about to drop the column `teacherId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `starTime` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `img` on the `Parent` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Teacher` table. All the data in the column will be lost.
  - Made the column `gradeId` on table `Class` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `startTime` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Made the column `subjectId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `classId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacherId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `birthday` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `gradeId` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `birthday` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserSex" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_classId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_gradeId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "teacherId",
ALTER COLUMN "supervisorId" DROP NOT NULL,
ALTER COLUMN "gradeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "starTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "subjectId" SET NOT NULL,
ALTER COLUMN "classId" SET NOT NULL,
ALTER COLUMN "teacherId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Parent" DROP COLUMN "bloodType",
DROP COLUMN "gender",
DROP COLUMN "img";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "gender",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sex" "UserSex" NOT NULL,
ALTER COLUMN "gradeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "gender",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sex" "UserSex" NOT NULL;

-- DropEnum
DROP TYPE "UserGender";

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
