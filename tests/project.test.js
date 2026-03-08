const request = require("supertest");
const app = require("../app");

describe("Test project endpoints", () => {
    let credentials;
    let projects;

    beforeAll(async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: 'dummy@test.com', 
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

    test("POST /projects/store should create a new project", async () => {
        const response = await request(app)
            .post("/api/projects/store")
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send({
                name: 'Mail Blast 9',
                description: 'Email marketing platform',
                status: 'started'
            });

        expect(response.statusCode).toBe(201);
        expect(response.text).toContain('Project created successfully');
    });

    test("GET /projects should list all auth user projects", async () => {
        const response = await request(app)
            .get("/api/projects")
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        projects = response._body.data.items
        expect(response.statusCode).toBe(200);
    });

    test("GET /projects/:id should list the specific project", async () => {
        const response = await request(app)
            .get(`/api/projects/show/${projects[0].id}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
    });

    test("PUT /projects/:id should update the specific project", async () => {
        const response = await request(app)
            .put(`/api/projects/update/${projects[0].id}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send({
                name: 'Mail Blast 9',
                description: 'Email marketing platform',
                status: 'Ongoing'
            });

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Project updated succesfully')
    });

    test("POST /project/:projectId/member should add project member", async () => {
        let projectId = projects[0].id
        let memberId = 2

        const response = await request(app)
            .post(`/api/project/${projectId}/member`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send({
                userId: memberId,
                role: 'member'
            });

        expect(response.statusCode).toBe(201);
        expect(response.text).toContain('Member added successfully')
    });

    test("DELETE /projects/:id should not allow owner delete project until re-assigned", async () => {
        const response = await request(app)
            .delete(`/api/projects/delete/${projects[0].id}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        expect(response.statusCode).toBe(422);
        expect(response.text).toContain('Kindly assign project owner to another user before deleting')
    });

    test("PUT /project/:id/member/:memberId should update project owner", async () => {
        let projectId = projects[0].id
        let memberId = 2

        const response = await request(app)
            .put(`/api/projects/${projectId}/member/${memberId}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Project owner updated succesfully')
    });

    test("DELETE /projects/:id should delete the specific project", async () => {
        const response = await request(app)
            .delete(`/api/projects/delete/${projects[0].id}`)
            .set('Authorization', `Bearer ${credentials.accessToken}`)
            .send();

        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Project deleted succesfully')
    });
})