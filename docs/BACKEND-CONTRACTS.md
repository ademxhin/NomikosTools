# Nomikos Tools — production backend handoff

The current repository is a React/Vite client. The new admin and customer workspaces run in an explicitly labelled demo mode and keep their operational data in isolated browser storage. They do not claim to provide production authentication, payments, shipping, invoices, email, or durable persistence.

## Required server capabilities

- Authentication: HttpOnly secure sessions, password hashing, reset and verification flows, MFA for privileged roles, rate limiting and session revocation.
- Authorization: enforce the same role grants as `workspacePolicy.ts` on every API operation. Client-side route and button checks are only presentation controls.
- Catalog: transactional product/category/variant writes; unique SKU, slug and barcode constraints; image/PDF object storage; category-cycle protection and redirect history for changed slugs.
- Orders: create from server-side product prices, reserve/decrement stock in one database transaction, use idempotency keys, immutable item/customer/address snapshots, append-only status history and cancellation stock release.
- Inventory: row locking or optimistic version checks, non-negative stock constraints, movement ledger, warehouse locations, count sessions and scoped barcode confirmation.
- Coupons: atomic usage counters, time/category/minimum validation on the server and a stored discount snapshot on each order.
- Customer data: owner-scoped addresses, orders, tickets and returns. Internal support notes must never be returned to customers.
- Audit: append-only records with actor, role, request ID, source IP, timestamp and redacted before/after fields. Never log passwords, tokens or full payment data.
- Integrations: payment intent/refund webhooks, ACS/BOX NOW labels and tracking, ERP/invoice provider, transactional email and optional VIES/AADE validation.

## Suggested API surface

`/api/auth/*`, `/api/products`, `/api/categories`, `/api/orders`, `/api/inventory/movements`, `/api/inventory/counts`, `/api/coupons`, `/api/customers`, `/api/tickets`, `/api/returns`, `/api/content`, `/api/imports`, `/api/audit` and `/api/integrations/*`.

List endpoints should accept server-side filters, stable sorting, cursor pagination and an explicit export job. Mutations should accept an idempotency key and return the committed aggregate plus its version.

## Database constraints and migrations

Use database migrations for unique normalized SKU/slug/barcode indexes, foreign keys, non-negative money/quantity checks, category ancestry, order snapshots, inventory ledger, coupon redemptions and audit records. Money must be stored in integer minor units or fixed precision decimals—never floating point.

## Environment and secrets

Only `VITE_DEMO_MODE` belongs in this client. Database URLs, auth/session secrets, object-storage credentials, payment and courier secrets, ERP credentials and mail provider keys must be server-only and supplied by the deployment secret manager. Never expose them through `VITE_*` variables.

## Cutover checklist

1. Implement the API and migrations in a separate server package.
2. Replace demo storage/context mutations with typed API calls and server sessions.
3. Import and reconcile the Excel-backed catalog in a staging database.
4. Run integration tests for authorization, ownership, simultaneous checkout, webhook replay, refund, cancellation and stock counts.
5. Connect sandbox accounts for payments/couriers/email/ERP, then complete webhook and failure-path tests.
6. Disable demo mode in production and verify no fixture or browser-local operational state is shown.
