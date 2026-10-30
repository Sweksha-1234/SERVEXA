# SERVEXA API reference

All request/response bodies are JSON. Authenticated routes require `Authorization: Bearer <token>`.

## Auth
- `POST /auth/register` `{name,email,password,role:"customer"|"provider",phone?}`. Password minimum 8 chars. Admin cannot self-register.
- `POST /auth/login` `{email,password}`
- `GET /auth/me`
- `PATCH /auth/me` editable profile fields: `name,phone,address,serviceArea,skills,experienceYears,hourlyRate,availability`

## Services
- `GET /services`
- `POST /services` (admin) `{name,description?,icon?}`
- `PATCH /services/:id` (admin) `{name?,description?,icon?,active?}`

## Providers
- `GET /providers?q=&serviceArea=&service=`
- `GET /providers/:id` only returns active, verified provider
- `PATCH /providers/me/services` (provider) `{services:[serviceId],skills:[...]}`

## Bookings
- `GET /bookings` returns the current user's bookings (admin sees all); optional `?status=`
- `POST /bookings` customer `{provider,service,problemDescription,address,scheduledAt,estimatedPrice?,problemImageUrl?}`
- `PATCH /bookings/:id/status` allowed lifecycle transitions are enforced server-side.
- `POST /bookings/:id/payment` customer, completed booking only. Demo-only payment record.
- `POST /bookings/:id/reviews` customer, completed booking only `{rating:1..5,comment?}`

## Complaints
- `GET /complaints` user's complaints; admin sees all
- `POST /complaints` `{subject,message,booking?}`
- `PATCH /complaints/:id` admin `{status?,adminResponse?}`

## Admin
All routes require admin role.
- `GET /admin/summary`
- `GET /admin/users?role=&verificationStatus=`
- `PATCH /admin/users/:id/verify` `{verificationStatus:"pending"|"verified"|"rejected",note?}`
- `PATCH /admin/users/:id/active` `{isActive:boolean}`
- `GET /admin/bookings`
