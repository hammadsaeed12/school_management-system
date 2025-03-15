// This is a script to update all the remaining files that use Clerk's auth function
// You can run this script with Node.js to update all the files at once

const fs = require('fs');
const path = require('path');

// List of files to update
const filesToUpdate = [
  'src/app/(dashboard)/teacher/page.tsx',
  'src/app/(dashboard)/student/page.tsx',
  'src/app/(dashboard)/parent/page.tsx',
  'src/app/(dashboard)/list/events/page.tsx',
  'src/app/(dashboard)/list/teachers/page.tsx',
  'src/app/(dashboard)/list/teachers/[id]/page.tsx',
  'src/app/(dashboard)/list/subjects/page.tsx',
  'src/app/(dashboard)/list/students/page.tsx',
  'src/app/(dashboard)/list/students/[id]/page.tsx',
  'src/app/(dashboard)/list/results/page.tsx',
  'src/app/(dashboard)/list/parents/page.tsx',
  'src/app/(dashboard)/list/lessons/page.tsx',
  'src/app/(dashboard)/list/exams/page.tsx',
  'src/app/(dashboard)/list/classes/page.tsx',
  'src/app/(dashboard)/list/assignments/page.tsx',
];

// Function to update a file
function updateFile(filePath) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the import
    const updatedContent = content.replace(
      /import\s+{\s*auth\s*}\s+from\s+["']@clerk\/nextjs\/server["'];?/g,
      `import { auth } from "@/lib/auth";`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Updated ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Update all files
filesToUpdate.forEach(updateFile);

console.log('All files updated successfully!'); 