const request = require("supertest");
const app = require("../app");

describe("Test project task endpoints", () => {
    let credentials;
    let tasks;
    let projects;
    let currentProjectId;
    let members;

    beforeAll(async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: 'user5@test.com', 
                password: 'User@123',
            });

        credentials = response._body
        expect(response.statusCode).toBe(200);
    });

    afterAll(async () => {
        const response = await request(app)
            .post("/api/auth/logout")
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        credentials = null
        projects = null
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Logged out successfully')
    });

    test("GET /projects should list all auth user projects", async () => {
        const response = await request(app)
            .get("/api/projects")
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        projects = response._body.data.items
        expect(response.statusCode).toBe(200);
    });

    test("POST /tasks/store should create a new project task", async () => {
        const projectIds = projects.map(project => project.id)
        const randomIndex = Math.floor(Math.random() * projectIds.length);
        currentProjectId = projectIds[randomIndex];

        const response = await request(app)
            .post(`/api/tasks/${currentProjectId}/store`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send({
                project_id: currentProjectId,
                title: 'Test task 3',
                description: 'Create the user authentication with sanctum',
                status: 'todo',
                priority: 'high',
                due_date: new Date().toISOString().split('T')[0],
            });

        expect(response.statusCode).toBe(201);
        expect(response.text).toContain('Task created successfully');
    });

    test("GET /tasks should list all specific project tasks", async () => {
        const response = await request(app)
            .get(`/api/tasks/${currentProjectId}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        tasks = response._body.data.items
        expect(response.statusCode).toBe(200);
    })

    test("GET /tasks/show/:id should return specific project tasks", async () => {
        const response = await request(app)
            .get(`/api/tasks/${currentProjectId}/show/${tasks[0].id}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
    })

    test("PUT /tasks/update/:id should update specific project task", async () => {
        const response = await request(app)
            .put(`/api/tasks/${currentProjectId}/update/${tasks[0].id}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send({
                title: 'Test task 3',
                description: 'Create the user authentication with sanctum',
                status: 'in-progress',
                priority: 'high',
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Task updated successfully');
    })

    test("POST /project/:projectId/member should add project member", async () => {
        let memberId = 4

        const response = await request(app)
            .post(`/api/project/${currentProjectId}/member`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send({
                userId: memberId,
                role: 'member'
            });

        expect(response.statusCode).toBe(201);
        expect(response.text).toContain('Member added successfully')
    });

    test("GET /project/:projectId/members should fetch all project members", async () => {
        const response = await request(app)
            .get(`/api/project/${currentProjectId}/members`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        members = response._body.data
        expect(response.statusCode).toBe(200);
    })

    test("POST /tasks/assign/:id should assign task to a project member", async () => {
        const response = await request(app)
            .post(`/api/tasks/${currentProjectId}/assign/${tasks[0].id}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send({
                projectId: currentProjectId,
                userId: members[0].user_id,
                assignedAt: new Date().toISOString().split('T')[0],
            });

        expect(response.statusCode).toBe(201);
        expect(response.text).toContain('Task assigned successfully')
    })
})