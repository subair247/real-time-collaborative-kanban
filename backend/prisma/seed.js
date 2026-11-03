const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding JulleyOnline Kanban database...');

    // 1. Clear existing data in reverse order of foreign keys
    await prisma.activityLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.organization.deleteMany();

    console.log('Cleared existing database records.');

    // 2. Create Organizations
    const orgABC = await prisma.organization.create({
        data: { name: 'ABC Technologies' },
    });

    const orgXYZ = await prisma.organization.create({
        data: { name: 'XYZ Solutions' },
    });

    console.log('Created Organizations: ABC Technologies & XYZ Solutions');

    // 3. Create Tenants (Branches)
    const tenantHyd = await prisma.tenant.create({
        data: { name: 'Hyderabad', organization_id: orgABC.id },
    });

    const tenantBlr = await prisma.tenant.create({
        data: { name: 'Bangalore', organization_id: orgABC.id },
    });

    const tenantChn = await prisma.tenant.create({
        data: { name: 'Chennai', organization_id: orgABC.id },
    });

    const tenantMum = await prisma.tenant.create({
        data: { name: 'Mumbai', organization_id: orgXYZ.id },
    });

    const tenantPun = await prisma.tenant.create({
        data: { name: 'Pune', organization_id: orgXYZ.id },
    });

    console.log('Created Tenants: Hyderabad, Bangalore, Chennai, Mumbai, Pune');

    // 4. Create Users (Default password: password123)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    const userRahul = await prisma.user.create({
        data: {
            name: 'Rahul',
            email: 'rahul@abc.com',
            password_hash: passwordHash,
        },
    });

    const userPriya = await prisma.user.create({
        data: {
            name: 'Priya',
            email: 'priya@abc.com',
            password_hash: passwordHash,
        },
    });

    const userArjun = await prisma.user.create({
        data: {
            name: 'Arjun',
            email: 'arjun@abc.com',
            password_hash: passwordHash,
        },
    });

    const userSneha = await prisma.user.create({
        data: {
            name: 'Sneha',
            email: 'sneha@abc.com',
            password_hash: passwordHash,
        },
    });

    const userKiran = await prisma.user.create({
        data: {
            name: 'Kiran',
            email: 'kiran@xyz.com',
            password_hash: passwordHash,
        },
    });

    console.log('Created 5 Test Users (Password: password123)');

    // 5. Create Memberships (Rahul gets Org Admin in BOTH ABC Technologies & XYZ Solutions)
    await prisma.membership.createMany({
        data: [
            {
                user_id: userRahul.id,
                organization_id: orgABC.id,
                tenant_id: tenantHyd.id,
                role: 'Org Admin',
            },
            {
                user_id: userRahul.id,
                organization_id: orgXYZ.id,
                tenant_id: tenantMum.id,
                role: 'Org Admin',
            },
            {
                user_id: userPriya.id,
                organization_id: orgABC.id,
                tenant_id: tenantHyd.id,
                role: 'Tenant Admin',
            },
            {
                user_id: userArjun.id,
                organization_id: orgABC.id,
                tenant_id: tenantHyd.id,
                role: 'Member',
            },
            {
                user_id: userSneha.id,
                organization_id: orgABC.id,
                tenant_id: tenantBlr.id,
                role: 'Tenant Admin',
            },
            {
                user_id: userKiran.id,
                organization_id: orgXYZ.id,
                tenant_id: tenantMum.id,
                role: 'Member',
            },
        ],
    });

    console.log('Assigned RBAC memberships to users.');

    // Helper function to seed a Board with standard 4 columns
    async function createBoardWithColumns(name, desc, orgId, tenantId, creatorId) {
        const board = await prisma.board.create({
            data: {
                name,
                description: desc,
                organization_id: orgId,
                tenant_id: tenantId,
                created_by: creatorId,
            },
        });

        const columns = await Promise.all([
            prisma.column.create({ data: { name: 'To Do', position: 1, board_id: board.id, tenant_id: tenantId } }),
            prisma.column.create({ data: { name: 'In Progress', position: 2, board_id: board.id, tenant_id: tenantId } }),
            prisma.column.create({ data: { name: 'Testing', position: 3, board_id: board.id, tenant_id: tenantId } }),
            prisma.column.create({ data: { name: 'Done', position: 4, board_id: board.id, tenant_id: tenantId } }),
        ]);

        return { board, columns };
    }

    // 6. Create Boards and Columns
    const hydWeb = await createBoardWithColumns(
        'Website Development',
        'Main corporate website redesign and customer portal',
        orgABC.id,
        tenantHyd.id,
        userRahul.id
    );

    const hydMobile = await createBoardWithColumns(
        'Mobile Application Development',
        'iOS and Android mobile app development for enterprise clients',
        orgABC.id,
        tenantHyd.id,
        userPriya.id
    );

    const blrCrm = await createBoardWithColumns(
        'CRM Development',
        'Internal CRM automation and customer lifecycle management',
        orgABC.id,
        tenantBlr.id,
        userSneha.id
    );

    const blrAi = await createBoardWithColumns(
        'AI Automation',
        'Agentic workflows and automated document intelligence',
        orgABC.id,
        tenantBlr.id,
        userSneha.id
    );

    const mumSupport = await createBoardWithColumns(
        'Customer Support Platform',
        'Omnichannel customer support ticketing platform',
        orgXYZ.id,
        tenantMum.id,
        userKiran.id
    );

    console.log('Created 5 Boards across Hyderabad, Bangalore & Mumbai with default 4 columns.');

    // 7. Create Sample Tasks
    const hydCols = hydWeb.columns;

    const tasksData = [
        {
            title: 'Create Login Page',
            description: 'Implement responsive login interface with email and password validation.',
            board_id: hydWeb.board.id,
            column_id: hydCols[0].id,
            tenant_id: tenantHyd.id,
            assigned_to: userRahul.id,
            position: 1,
            version: 1,
        },
        {
            title: 'Fix API Validation',
            description: 'Validate incoming payloads using Zod middleware before processing database queries.',
            board_id: hydWeb.board.id,
            column_id: hydCols[0].id,
            tenant_id: tenantHyd.id,
            assigned_to: userArjun.id,
            position: 2,
            version: 1,
        },
        {
            title: 'Develop Registration API',
            description: 'Implement POST /api/auth/register endpoint with bcrypt hashing and JWT generation.',
            board_id: hydWeb.board.id,
            column_id: hydCols[1].id,
            tenant_id: tenantHyd.id,
            assigned_to: userArjun.id,
            position: 1,
            version: 1,
        },
        {
            title: 'Test Authentication',
            description: 'Verify JWT expiration, cookie handling, and unauthorized access rejections.',
            board_id: hydWeb.board.id,
            column_id: hydCols[2].id,
            tenant_id: tenantHyd.id,
            assigned_to: userPriya.id,
            position: 1,
            version: 1,
        },
        {
            title: 'Deploy Dashboard',
            description: 'Setup production build and verify multi-tenant isolation in cloud deployment.',
            board_id: hydWeb.board.id,
            column_id: hydCols[3].id,
            tenant_id: tenantHyd.id,
            assigned_to: userRahul.id,
            position: 1,
            version: 1,
        },
        {
            title: 'Lead Pipeline Architecture',
            description: 'Design CRM pipeline workflow for enterprise deal tracking.',
            board_id: blrCrm.board.id,
            column_id: blrCrm.columns[0].id,
            tenant_id: tenantBlr.id,
            assigned_to: userSneha.id,
            position: 1,
            version: 1,
        },
        {
            title: 'Data Migration Scripts',
            description: 'Migrate legacy customer data into the new multi-tenant database schema.',
            board_id: blrCrm.board.id,
            column_id: blrCrm.columns[1].id,
            tenant_id: tenantBlr.id,
            assigned_to: userSneha.id,
            position: 1,
            version: 1,
        },
        {
            title: 'Ticket Escalation Workflow',
            description: 'Build SLA-based automated routing for high-priority support tickets.',
            board_id: mumSupport.board.id,
            column_id: mumSupport.columns[0].id,
            tenant_id: tenantMum.id,
            assigned_to: userKiran.id,
            position: 1,
            version: 1,
        },
    ];

    for (const t of tasksData) {
        await prisma.task.create({ data: t });
    }

    // 8. Seed Initial Activity Logs
    await prisma.activityLog.createMany({
        data: [
            {
                tenant_id: tenantHyd.id,
                user_id: userRahul.id,
                entity_type: 'task',
                entity_id: userRahul.id,
                action: 'Created',
                details: { title: 'Create Login Page', column: 'To Do' },
            },
            {
                tenant_id: tenantHyd.id,
                user_id: userArjun.id,
                entity_type: 'task',
                entity_id: userArjun.id,
                action: 'Updated',
                details: { title: 'Develop Registration API', column: 'In Progress' },
            },
            {
                tenant_id: tenantHyd.id,
                user_id: userRahul.id,
                entity_type: 'task',
                entity_id: userRahul.id,
                action: 'Moved',
                details: { from_column: 'Testing', to_column: 'Done', title: 'Deploy Dashboard' },
            },
            {
                tenant_id: tenantBlr.id,
                user_id: userSneha.id,
                entity_type: 'board',
                entity_id: blrCrm.board.id,
                action: 'Created',
                details: { title: 'CRM Development' },
            },
        ],
    });

    console.log('Seeded successfully with Rahul in BOTH ABC Technologies & XYZ Solutions!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });