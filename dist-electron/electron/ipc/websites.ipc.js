"use strict";
// electron/ipc/websites.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebsiteHandlers = registerWebsiteHandlers;
const ipc_helper_1 = require("./ipc.helper");
const website_repository_1 = require("../../src/database/repositories/website.repository");
function registerWebsiteHandlers() {
    (0, ipc_helper_1.handle)('websites:getAll', () => website_repository_1.WebsiteRepository.findAll());
    (0, ipc_helper_1.handle)('websites:getById', (id) => website_repository_1.WebsiteRepository.findById(id));
    (0, ipc_helper_1.handle)('websites:search', (query) => website_repository_1.WebsiteRepository.search(query));
    (0, ipc_helper_1.handle)('websites:create', (data) => website_repository_1.WebsiteRepository.create(data));
    (0, ipc_helper_1.handle)('websites:update', (data) => website_repository_1.WebsiteRepository.update(data));
    (0, ipc_helper_1.handle)('websites:delete', (id) => website_repository_1.WebsiteRepository.delete(id));
    (0, ipc_helper_1.handle)('websites:toggleFavorite', (id) => website_repository_1.WebsiteRepository.toggleFavorite(id));
}
//# sourceMappingURL=websites.ipc.js.map