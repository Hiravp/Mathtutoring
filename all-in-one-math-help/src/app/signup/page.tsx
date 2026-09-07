import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentUserProfile, homePathForProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign up · All-in-One Math Help",
};

export default async function SignupPage() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    redirect(homePathForProfile(profile));
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="space-y-2 text-center">
        <Link
          href="/"
          className="text-muted-foreground text-sm font-medium tracking-wide uppercase hover:text-foreground"
        >
          All-in-One Math Help
        </Link>
        <h1 className="sr-only">Sign up</h1>
      </div>
      <SignupForm />
    </main>
  );
}
