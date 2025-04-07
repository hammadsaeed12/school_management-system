import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import ProfileContent from "./components/ProfileContent";

const ProfilePage = async () => {
  const headersInstance = headers();
  const { userId, sessionClaims } = await auth(headersInstance);
  const role = (sessionClaims?.metadata as { role?: string })?.role || "student";

  return <ProfileContent userId={userId} role={role} />;
};

export default ProfilePage;