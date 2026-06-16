"use strict";
// electron/ipc/applications.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApplicationHandlers = registerApplicationHandlers;
const ipc_helper_1 = require("./ipc.helper");
const application_repository_1 = require("../../src/database/repositories/application.repository");
function registerApplicationHandlers() {
    (0, ipc_helper_1.handle)('applications:getAll', () => application_repository_1.ApplicationRepository.findAll());
    (0, ipc_helper_1.handle)('applications:getById', (id) => application_repository_1.ApplicationRepository.findById(id));
    (0, ipc_helper_1.handle)('applications:search', (query) => application_repository_1.ApplicationRepository.search(query));
    (0, ipc_helper_1.handle)('applications:create', (data) => application_repository_1.ApplicationRepository.create(data));
    (0, ipc_helper_1.handle)('applications:update', (data) => application_repository_1.ApplicationRepository.update(data));
    (0, ipc_helper_1.handle)('applications:delete', (id) => application_repository_1.ApplicationRepository.delete(id));
    (0, ipc_helper_1.handle)('applications:toggleFavorite', (id) => application_repository_1.ApplicationRepository.toggleFavorite(id));
}
//# sourceMappingURL=applications.ipc.js.map