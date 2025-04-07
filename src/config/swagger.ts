import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Event Registration System API',
            version: '1.0.0',
            description: 'API documentation for the Event Registration System',
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: [
        path.resolve(__dirname, '../routes/*.ts'),
        path.resolve(__dirname, '../controllers/*.ts'),
        path.resolve(__dirname, '../types/*.ts'),
    ],
};

const specs = swaggerJsdoc(options);

export default specs;