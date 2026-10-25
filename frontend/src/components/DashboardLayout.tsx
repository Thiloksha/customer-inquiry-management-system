import { NavLink, Outlet, useNavigate } from 'react-router-dom'

function DashboardLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('staff')
    navigate('/login', { replace: true })
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <div className="min-h-screen bg-slate-50 md:pl-60">
      <aside className="flex min-h-screen flex-col border-r border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-60">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            IC
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            InquiryDesk
          </span>
        </div>

        <div className="px-6 pb-3 pt-8 text-xs font-semibold tracking-wider text-slate-400">
          WORKSPACE
        </div>

        <nav className="space-y-1 px-3">
          <NavLink to="/dashboard" className={navLinkClass} end>
            <span className="text-lg">⌂</span>
            Dashboard
          </NavLink>

          <NavLink to="/inquiries" className={navLinkClass}>
            <span className="text-lg">▤</span>
            Inquiries
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="mb-4 flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
              S
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Staff Workspace
              </p>
              <p className="mt-1 text-xs text-slate-500">Support team</p>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <span className="text-sm font-medium text-slate-600">
            Customer Support Workspace
          </span>

          <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Workspace active
          </span>
        </header>

        <main className="p-5 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
