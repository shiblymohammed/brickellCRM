import { getCurrentUser } from '@/lib/auth/supabase'
import { prisma } from '@/lib/db/prisma'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomBar from './BottomBar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  let userName = 'Admin'
  let userRole = 'Admin'

  if (user) {
    const employee = await prisma.employee.findUnique({
      where: { userId: user.id },
      select: { name: true, role: true }
    })
    if (employee) {
      userName = employee.name
      userRole = employee.role.replace(/_/g, ' ')
    }
  }

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar userName={userName} userRole={userRole} />
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden w-full relative">
        <Topbar userName={userName} userRole={userRole} />
        {/* pb-24 on mobile to account for the BottomBar + floating action button */}
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
        <BottomBar />
      </div>
    </div>
  )
}
