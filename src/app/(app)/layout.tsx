import { requireUser } from "@/server/auth";
import { AppHeader } from "@/components/app-header";
import { ToastProvider } from "@/components/ui/toast";

/** Layout area terautentikasi. Middleware sudah menjaga rute ini. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <ToastProvider>
      <div className="flex min-h-full flex-col bg-neutral-50">
        <AppHeader userName={user.name} />
        {children}
      </div>
    </ToastProvider>
  );
}
