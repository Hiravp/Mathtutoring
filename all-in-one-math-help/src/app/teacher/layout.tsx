import { RoleGateLayout } from "@/components/auth/role-gate-layout";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGateLayout requiredRole="teacher" title="Teacher">
      {children}
    </RoleGateLayout>
  );
}
