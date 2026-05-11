-- Fix SERIAL sequences that were corrupted during migration

-- Reset sequences for users table
SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX(id) FROM "users"), 0) + 1);

-- Reset sequences for employees table
SELECT setval(pg_get_serial_sequence('"employees"', 'id'), COALESCE((SELECT MAX(id) FROM "employees"), 0) + 1);

-- Reset sequences for check_ins table
SELECT setval(pg_get_serial_sequence('"check_ins"', 'id'), COALESCE((SELECT MAX(id) FROM "check_ins"), 0) + 1);

-- Reset sequences for leave_requests table
SELECT setval(pg_get_serial_sequence('"leave_requests"', 'id'), COALESCE((SELECT MAX(id) FROM "leave_requests"), 0) + 1);

-- Reset sequences for leave_balances table
SELECT setval(pg_get_serial_sequence('"leave_balances"', 'id'), COALESCE((SELECT MAX(id) FROM "leave_balances"), 0) + 1);

-- Reset sequences for settings table
SELECT setval(pg_get_serial_sequence('"settings"', 'id'), COALESCE((SELECT MAX(id) FROM "settings"), 0) + 1);

-- Reset sequences for employees employeeId auto-increment
SELECT setval(pg_get_serial_sequence('"employees"', 'employeeId'), COALESCE((SELECT MAX("employeeId") FROM "employees"), 0) + 1);
