import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";

type Inquiry = {
  id: string;
  inquiryNumber: number;
  customerName: string;
  contactInfo: string;
  subject: string;
  description: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
};

type InquiryForm = {
  customerName: string;
  contactInfo: string;
  subject: string;
  description: string;
};

type RequestError = Error & {
  status?: number;
  code?: string;
};

const emptyForm: InquiryForm = {
  customerName: "",
  contactInfo: "",
  subject: "",
  description: "",
};

function InquiriesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [form, setForm] = useState<InquiryForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [updatingInquiryId, setUpdatingInquiryId] = useState<string | null>(
    null,
  );
  const [statusError, setStatusError] = useState("");

  // Reuse this key when confirming or retrying the same submission.
  const submissionKey = useRef<string | null>(null);

  async function loadInquiries() {
    try {
      setError("");
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const query = params.toString();
      const data = await apiRequest(`/inquiries${query ? `?${query}` : ""}`);
      setInquiries(data.inquiries);
    } catch (err) {
      const requestError = err as RequestError;

      if (requestError.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("staff");
        navigate("/login", { replace: true });
        return;
      }

      setError(
        err instanceof TypeError
          ? "Unable to connect to the server. Please try again."
          : requestError.message || "Unable to load inquiries.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    inquiryId: string,
    newStatus: Inquiry["status"],
  ) {
    setUpdatingInquiryId(inquiryId);
    setStatusError("");

    try {
      await apiRequest(`/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      await loadInquiries();
    } catch (err) {
      const requestError = err as RequestError;

      if (requestError.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("staff");
        navigate("/login", { replace: true });
        return;
      }

      setStatusError(
        requestError.message || "Unable to update the inquiry status.",
      );
    } finally {
      setUpdatingInquiryId(null);
    }
  }

  useEffect(() => {
    void loadInquiries();
  }, [search, statusFilter]);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setIsFormOpen(true);

      // Remove the query parameter after opening the form.
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function handleFieldChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function submitInquiry(allowDuplicate: boolean) {
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!submissionKey.current) {
      submissionKey.current = crypto.randomUUID();
    }

    try {
      const result = await apiRequest("/inquiries", {
        method: "POST",
        headers: {
          "Idempotency-Key": submissionKey.current,
          ...(allowDuplicate ? { "X-Allow-Duplicate": "true" } : {}),
        },
        body: JSON.stringify(form),
      });

      setDuplicateWarning(false);
      setForm(emptyForm);
      submissionKey.current = null;
      setIsFormOpen(false);

      setSuccess(result.message || "Inquiry created successfully.");
      await loadInquiries();
    } catch (err) {
      const requestError = err as RequestError;

      if (
        requestError.status === 409 &&
        requestError.code === "POSSIBLE_DUPLICATE"
      ) {
        setDuplicateWarning(true);
      } else if (requestError.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("staff");
        navigate("/login", { replace: true });
      } else {
        setError(
          err instanceof TypeError
            ? "Unable to connect to the server. Please try again."
            : requestError.message || "Unable to create the inquiry.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDuplicateWarning(false);
    void submitInquiry(false);
  }

  function handleCancelDuplicate() {
    setDuplicateWarning(false);
    submissionKey.current = null;
    setSuccess("Submission cancelled. No new inquiry was created.");
  }

  return (
    <main className="6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Customer Inquiries
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Create and manage your customer inquiries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setDuplicateWarning(false);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-lg font-bold !text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          <span className="font-semibold">+ Add Inquiry</span>
        </button>
      </header>
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setIsFormOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-form-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4">
              <h2
                id="inquiry-form-title"
                className="text-lg font-semibold text-slate-900"
              >
                Create New Inquiry
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the customer details below.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Customer Name *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleFieldChange}
                    maxLength={100}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactInfo"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Contact Information *
                  </label>
                  <input
                    id="contactInfo"
                    name="contactInfo"
                    value={form.contactInfo}
                    onChange={handleFieldChange}
                    maxLength={150}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Subject *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleFieldChange}
                    maxLength={150}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleFieldChange}
                    maxLength={5000}
                    rows={4}
                    required
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {error && (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  role="status"
                >
                  {success}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setError("");
                    setSuccess("");
                    setDuplicateWarning(false);
                    submissionKey.current = null;
                    setIsFormOpen(false);
                  }}
                  disabled={submitting}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold !text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Inquiry"}
                </button>
              </div>
            </form>

            {duplicateWarning && (
              <section
                className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4"
                role="alertdialog"
                aria-labelledby="duplicate-title"
              >
                <h3
                  id="duplicate-title"
                  className="font-semibold text-amber-900"
                >
                  Possible Duplicate Inquiry
                </h3>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  A similar open inquiry may already exist. Please check before
                  continuing. Continue only if this is a separate issue.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleCancelDuplicate}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitInquiry(true)}
                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold !text-white hover:bg-amber-700 disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Continue anyway"}
                  </button>
                </div>
              </section>
            )}
          </section>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {statusError && (
          <p
            className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700"
            role="alert"
          >
            {statusError}
          </p>
        )}

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Inquiries
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View and manage the inquiries you have submitted.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="inquiry-search"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Search inquiries
              </label>
              <input
                id="inquiry-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Customer, contact, or subject..."
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Filter by status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">All statuses</option>
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {(search || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Clear search and filters
            </button>
          )}
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            Loading inquiries...
          </p>
        ) : error && inquiries.length === 0 ? (
          <p
            className="px-6 py-10 text-center text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        ) : inquiries.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">
            No inquiries found. Create your first inquiry above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-4 font-semibold">Inquiry ID</th>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Subject</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-3 py-4 font-semibold">Change Status</th>
                  <th className="px-5 py-4 font-semibold">Date Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="transition hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium">
                      {`I${String(inquiry.inquiryNumber).padStart(4, "0")}`}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {inquiry.customerName}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {inquiry.subject}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {inquiry.contactInfo}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          inquiry.status === "NEW"
                            ? "bg-blue-50 text-blue-700"
                            : inquiry.status === "IN_PROGRESS"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {inquiry.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <select
                        value={inquiry.status}
                        disabled={updatingInquiryId === inquiry.id}
                        onChange={(event) =>
                          void handleStatusChange(
                            inquiry.id,
                            event.target.value as Inquiry["status"],
                          )
                        }
                        className="w-30 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
                        aria-label={`Change status for ${inquiry.subject}`}
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>

                      {updatingInquiryId === inquiry.id && (
                        <p className="mt-1 text-xs text-slate-500">
                          Updating...
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default InquiriesPage;
