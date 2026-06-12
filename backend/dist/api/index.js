"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const common_1 = require("@nestjs/common");
let cachedApp;
async function bootstrap() {
    if (cachedApp)
        return cachedApp;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: true,
        logger: false,
    });
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    await app.init();
    cachedApp = app;
    return cachedApp;
}
async function handler(req, res) {
    try {
        const app = await bootstrap();
        const server = app.getHttpAdapter().getInstance();
        return server(req, res);
    }
    catch (e) {
        res.status(500).json({ error: 'Server init failed', detail: e.message });
    }
}
//# sourceMappingURL=index.js.map