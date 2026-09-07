import { RoleGateLayout } from "@/components/auth/role-gate-layout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGateLayout requiredRole="student" title="Student">
      {children}
    </RoleGateLayout>
  );
}
