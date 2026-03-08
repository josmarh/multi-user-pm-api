const request = require("supertest");
const app = require("../app");

describe("Test the guest authentication endpoints", () => {
    let accessTokens;

    test("POST /register should register a new user successfully", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: 'Test Dummy',
                email: 'dummy@test.com', 
                password: 'User@123',
                passwordConfirmation: 'User@123'
            });

            expect(response.statusCode).toBe(201);
            expect(response.text).toContain("Registeration successful");
    });

    test("POST /login should login an existing user successfully", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: 'dummy@test.com', 
                password: 'User@123',
            });

            expect(response.statusCode).toBe(200);
    });

    beforeAll(async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: 'dummy@test.com', 
                password: 'User@123',
            });

        accessTokens = response._body
        expect(response.statusCode).toBe(200);
    });

    test.only("POST /logout should logout an authentication user successfully", async () => {
        const response = await request(app)
            .post("/api/auth/logout")
            .set('Authorization', `Bearer ${accessTokens.accessToken}`)
            .send()

            expect(response.statusCode).toBe(200);
            expect(response.text).toContain('Logged out successfully')
    });
});