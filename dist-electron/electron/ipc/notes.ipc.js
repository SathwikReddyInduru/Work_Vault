"use strict";
// electron/ipc/notes.ipc.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNoteHandlers = registerNoteHandlers;
const ipc_helper_1 = require("./ipc.helper");
const note_repository_1 = require("../../src/database/repositories/note.repository");
function registerNoteHandlers() {
    (0, ipc_helper_1.handle)('notes:getAll', () => note_repository_1.NoteRepository.findAll());
    (0, ipc_helper_1.handle)('notes:getById', (id) => note_repository_1.NoteRepository.findById(id));
    (0, ipc_helper_1.handle)('notes:search', (query) => note_repository_1.NoteRepository.search(query));
    (0, ipc_helper_1.handle)('notes:create', (data) => note_repository_1.NoteRepository.create(data));
    (0, ipc_helper_1.handle)('notes:update', (data) => note_repository_1.NoteRepository.update(data));
    (0, ipc_helper_1.handle)('notes:delete', (id) => note_repository_1.NoteRepository.delete(id));
    (0, ipc_helper_1.handle)('notes:togglePin', (id) => note_repository_1.NoteRepository.togglePin(id));
}
//# sourceMappingURL=notes.ipc.js.map