const { z } = require('zod');

// Auth schemas
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Organization schemas
const createOrgSchema = z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
});

// Tenant schemas
const createTenantSchema = z.object({
    name: z.string().min(2, 'Tenant name must be at least 2 characters'),
    organization_id: z.string().uuid('Valid organization_id UUID is required'),
});

// Board schemas
const createBoardSchema = z.object({
    name: z.string().min(2, 'Board name must be at least 2 characters'),
    description: z.string().optional(),
    organization_id: z.string().uuid('Valid organization_id UUID is required'),
    tenant_id: z.string().uuid('Valid tenant_id UUID is required'),
});

// Column schemas
const createColumnSchema = z.object({
    name: z.string().min(1, 'Column name is required'),
    board_id: z.string().uuid('Valid board_id UUID is required'),
    position: z.number().int().min(1, 'Position must be a positive integer').optional(),
});

// Task schemas
const createTaskSchema = z.object({
    title: z.string().min(1, 'Task title cannot be empty'),
    description: z.string().optional(),
    board_id: z.string().uuid('Valid board_id UUID is required'),
    column_id: z.string().uuid('Valid column_id UUID is required'),
    tenant_id: z.string().uuid('Valid tenant_id UUID is required'),
    assigned_to: z.string().uuid().optional().nullable(),
    position: z.number().int().min(1).optional(),
});

const updateTaskSchema = z.object({
    title: z.string().min(1, 'Task title cannot be empty').optional(),
    description: z.string().optional().nullable(),
    assigned_to: z.string().uuid().optional().nullable(),
    column_id: z.string().uuid().optional(),
    position: z.number().int().min(1).optional(),
    expected_version: z.number().int().min(1).optional(),
});

const moveTaskSchema = z.object({
    destination_column_id: z.string().uuid('Valid destination_column_id UUID is required'),
    new_position: z.number().int().min(1, 'new_position must be a positive integer'),
    expected_version: z.number().int().min(1).optional(),
});

module.exports = {
    registerSchema,
    loginSchema,
    createOrgSchema,
    createTenantSchema,
    createBoardSchema,
    createColumnSchema,
    createTaskSchema,
    updateTaskSchema,
    moveTaskSchema,
};