import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../services/api'

type Inquiry = {
  id: string
  customerName: string
  subject: string
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED'
  createdAt: string
}

function DashboardPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await apiRequest('/inquiries')
        setInquiries(data.inquiries)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load dashboard data.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const total = inquiries.length
  const newCount = inquiries.filter(
    (item) => item.status === 'NEW',
  ).length
  const inProgressCount = inquiries.filter(
    (item) => item.status === 'IN_PROGRESS',
  ).length
  const resolvedCount = inquiries.filter(
    (item) => item.status === 'RESOLVED',
  ).length

  const stats = [
    {
      label: 'Total Inquiries',
      value: total,
      description: 'Your submitted inquiries',
      color: 'text-slate-900',
    },
    {
      label: 'New',
      value: newCount,
      description: 'Awaiting progress',
      color: 'text-blue-600',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      description: 'Currently being handled',
      color: 'text-amber-600',
    },
    {
      label: 'Resolved',
      value: resolvedCount,
      description: 'Successfully resolved',
      color: 'text-emerald-600',
    },
  ]

  const statusStyles = {
    NEW: 'bg-blue-50 text-blue-700',
    IN_PROGRESS: 'bg-amber-50 text-amber-700',
    RESOLVED: 'bg-emerald-50 text-emerald-700',
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Here&apos;s your inquiry overview.
          </p>
        </div>

        <Link
          to="/inquiries?add=true"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          + Add Inquiry
        </Link>
      </div>

      {error && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.label}
            </p>

            <p className={`mt-3 text-3xl font-bold ${stat.color}`}>
              {loading ? '—' : stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {stat.description}
            </p>
          </article>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Inquiries
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your latest customer inquiries.
            </p>
          </div>

          <Link
            to="/inquiries"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            Loading inquiries...
          </p>
        ) : inquiries.length === 0 && !error ? (
          <div className="px-6 py-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              No inquiries yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create your first inquiry to get started.
            </p>

            <Link
              to="/inquiries/new"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add your first inquiry
            </Link>
          </div>
        ) : !error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inquiries.slice(0, 4).map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {inquiry.customerName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {inquiry.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[inquiry.status]
                        }`}
                      >
                        {inquiry.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default DashboardPage
