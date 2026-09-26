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
      <div className="flex-1 h-[100dvh] w-full relative">
        <div className="absolute top-0 inset-x-0 z-40">
          <Topbar userName={userName} userRole={userRole} />
        </div>
        <main className="absolute inset-0 overflow-auto md:p-6 w-full z-0">
          <div className="h-[52px] md:h-16 w-full flex-shrink-0" /> {/* Topbar Spacer */}
          {children}
        </main>
        <BottomBar />
      </div>
    </div>
  )
}
