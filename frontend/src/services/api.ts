
const API_BASE_URL = 'http://localhost:5000'

export async function apiRequest(
  path: string,
  options: RequestInit = {},
) {
  const token = sessionStorage.getItem('token')

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      data?.message || 'Something went wrong. Please try again.',
    )

    Object.assign(error, {
      status: response.status,
      code: data?.code,
      data,
    })

    throw error
  }

  return data
}
