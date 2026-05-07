"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const cleanitbooks_seed_1 = require("./cleanitbooks/cleanitbooks.seed");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS' });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CleanIT ERP API')
        .setDescription('ERP Telecom Cameroun')
        .setVersion('2.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    await app.listen(3000);
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        await (0, cleanitbooks_seed_1.seedCleanITBooks)(dataSource);
    }
    catch (e) {
        console.error('Seed CleanITBooks erreur:', e.message);
    }
    console.log('\n🚀 CleanIT ERP Backend: http://localhost:3000');
    console.log('📚 API Docs: http://localhost:3000/api/docs\n');
}
bootstrap();
//# sourceMappingURL=main.js.map