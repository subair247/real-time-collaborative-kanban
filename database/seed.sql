INSERT INTO organizations (id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'ABC Technologies'),
('22222222-2222-2222-2222-222222222222', 'XYZ Solutions')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenants (id, organization_id, name) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Hyderabad'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Bangalore'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Chennai'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Mumbai'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'Pune')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, password_hash) VALUES
('u1111111-1111-1111-1111-111111111111', 'Rahul', 'rahul@abc.com', '$2b$10$f34cIeqqT4f79fO1P5hP8.y59yQ82Z4/j2d7Kx7H8Gv5E9L4h7s3C'),
('u2222222-2222-2222-2222-222222222222', 'Priya', 'priya@abc.com', '$2b$10$f34cIeqqT4f79fO1P5hP8.y59yQ82Z4/j2d7Kx7H8Gv5E9L4h7s3C'),
('u3333333-3333-3333-3333-333333333333', 'Arjun', 'arjun@abc.com', '$2b$10$f34cIeqqT4f79fO1P5hP8.y59yQ82Z4/j2d7Kx7H8Gv5E9L4h7s3C'),
('u4444444-4444-4444-4444-444444444444', 'Sneha', 'sneha@abc.com', '$2b$10$f34cIeqqT4f79fO1P5hP8.y59yQ82Z4/j2d7Kx7H8Gv5E9L4h7s3C'),
('u5555555-5555-5555-5555-555555555555', 'Kiran', 'kiran@xyz.com', '$2b$10$f34cIeqqT4f79fO1P5hP8.y59yQ82Z4/j2d7Kx7H8Gv5E9L4h7s3C')
ON CONFLICT (id) DO NOTHING;

INSERT INTO memberships (id, user_id, organization_id, tenant_id, role) VALUES
('m1111111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Org Admin'),
('m2222222-2222-2222-2222-222222222222', 'u2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tenant Admin'),
('m3333333-3333-3333-3333-333333333333', 'u3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Member'),
('m4444444-4444-4444-4444-444444444444', 'u4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tenant Admin'),
('m5555555-5555-5555-5555-555555555555', 'u5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Member')
ON CONFLICT (id) DO NOTHING;

INSERT INTO boards (id, organization_id, tenant_id, name, description, created_by) VALUES
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Website Development', 'Main corporate website redesign', 'u1111111-1111-1111-1111-111111111111'),
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'CRM Development', 'Internal CRM pipeline and automation', 'u4444444-4444-4444-4444-444444444444')
ON CONFLICT (id) DO NOTHING;

INSERT INTO columns (id, board_id, tenant_id, name, position) VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'To Do', 1),
('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'In Progress', 2),
('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Testing', 3),
('c4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Done', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tasks (id, board_id, column_id, tenant_id, title, description, assigned_to, position, version) VALUES
('t1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Create Login Page', 'Implement login UI with email/password validation', 'u1111111-1111-1111-1111-111111111111', 1, 1),
('t2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Develop Registration API', 'Implement bcrypt hashing and JWT endpoints', 'u3333333-3333-3333-3333-333333333333', 1, 1),
('t3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test Authentication', 'Verify JWT cookies and unauthorized rejections', 'u2222222-2222-2222-2222-222222222222', 1, 1),
('t4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Deploy Dashboard', 'Verify multi-tenant isolation in cloud deployment', 'u1111111-1111-1111-1111-111111111111', 1, 1)
ON CONFLICT (id) DO NOTHING;
