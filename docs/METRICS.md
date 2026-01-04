# Prometheus Metrics Page

Page: `/metrics`

It fetches Prometheus text from the backend:
- server-side route: `/api/backend/prometheus` (avoids browser CORS)
- backend endpoint: `${NEXT_PUBLIC_API_BASE_URL}/actuator/prometheus`

The UI parses the exposition format and shows key counters as bars + raw text.
