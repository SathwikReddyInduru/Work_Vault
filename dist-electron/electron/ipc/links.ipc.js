"use strict";
// electron/ipc/links.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLinkHandlers = registerLinkHandlers;
const ipc_helper_1 = require("./ipc.helper");
const link_repository_1 = require("../../src/database/repositories/link.repository");
function registerLinkHandlers() {
    (0, ipc_helper_1.handle)('links:getAll', () => link_repository_1.LinkRepository.findAll());
    (0, ipc_helper_1.handle)('links:getById', (id) => link_repository_1.LinkRepository.findById(id));
    (0, ipc_helper_1.handle)('links:search', (query) => link_repository_1.LinkRepository.search(query));
    (0, ipc_helper_1.handle)('links:create', (data) => link_repository_1.LinkRepository.create(data));
    (0, ipc_helper_1.handle)('links:update', (data) => link_repository_1.LinkRepository.update(data));
    (0, ipc_helper_1.handle)('links:delete', (id) => link_repository_1.LinkRepository.delete(id));
    (0, ipc_helper_1.handle)('links:toggleFavorite', (id) => link_repository_1.LinkRepository.toggleFavorite(id));
}
//# sourceMappingURL=links.ipc.js.map