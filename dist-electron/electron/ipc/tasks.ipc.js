"use strict";
// electron/ipc/tasks.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaskHandlers = registerTaskHandlers;
const ipc_helper_1 = require("./ipc.helper");
const task_repository_1 = require("../../src/database/repositories/task.repository");
function registerTaskHandlers() {
    (0, ipc_helper_1.handle)('tasks:getAll', () => task_repository_1.TaskRepository.findAll());
    (0, ipc_helper_1.handle)('tasks:getById', (id) => task_repository_1.TaskRepository.findById(id));
    (0, ipc_helper_1.handle)('tasks:search', (query) => task_repository_1.TaskRepository.search(query));
    (0, ipc_helper_1.handle)('tasks:create', (data) => task_repository_1.TaskRepository.create(data));
    (0, ipc_helper_1.handle)('tasks:update', (data) => task_repository_1.TaskRepository.update(data));
    (0, ipc_helper_1.handle)('tasks:delete', (id) => task_repository_1.TaskRepository.delete(id));
    (0, ipc_helper_1.handle)('tasks:updateStatus', (id, status) => task_repository_1.TaskRepository.updateStatus(id, status));
}
//# sourceMappingURL=tasks.ipc.js.map