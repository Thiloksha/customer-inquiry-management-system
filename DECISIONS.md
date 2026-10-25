# Design Decisions

## 1. Assumptions

- The system is intended for staff members who need to record, find, and manage customer inquiries.
- Staff accounts are created through database seeding rather than public registration.
- Each staff member can access and manage only the inquiries they created.
- Each inquiry must include a customer name, contact information, subject, and description.
- Inquiries follow three statuses: `NEW`, `IN_PROGRESS`, and `RESOLVED`.
- Duplicate submissions should be prevented, and inquiry records should remain stored in the database.

## 2. Key Design Choices

### PostgreSQL with Prisma

PostgreSQL was selected as the relational database because staff and inquiry records have a clear relationship. Prisma provides type-safe database access and migration management, making the schema easier to maintain and reproduce.

### JWT-Based Authentication

JSON Web Tokens (JWT) are used to authenticate staff requests. Protected backend endpoints verify authentication before allowing access to inquiry operations. Passwords are stored as bcrypt hashes rather than plain text.

### Server-Side Validation and Duplicate Prevention

Zod validates required inquiry fields on the backend. Idempotency keys prevent repeated requests using the same submission key from creating additional records. The system also warns users about potentially similar open inquiries before allowing them to continue.

Status transitions are restricted to NEW → IN_PROGRESS, IN_PROGRESS → RESOLVED, and RESOLVED → IN_PROGRESS. Invalid transitions are rejected by the API.

## 3. Trade-Off and Stale Data Handling

Seeded staff accounts were chosen instead of public registration and account management to keep the implementation focused on the core workflow. The trade-off is that staff accounts must be created and maintained separately.

The application does not provide real-time synchronization between browser tabs. A tab may therefore display an outdated status after another tab updates the same inquiry. Users can reload the inquiry list to retrieve the latest data. Real-time updates or explicit conflict detection could improve this in a future version.

## 4. Future Improvements

- Add more automated tests covering authentication, inquiry validation, duplicate submissions, and frontend interactions.
- Improve staff account management and introduce role-based permissions if multiple staff roles are required.
- Add pagination for large inquiry lists and improve search performance as the dataset grows.
- Add structured logging and monitoring to improve troubleshooting and production reliability.

## 5. Use of AI

AI tools helped me review the requirements, explore implementation choices, and develop test examples. I reviewed and adapted suggestions to fit my application, including testing backend authentication enforcement and the frontend inquiry-creation interaction.