'use strict';

/**
 * Module dependencies.
 */
var notes = require('../../app/controllers/notes.server.controller'),
    multer = require('multer'),
    users = require('../../app/controllers/users.server.controller');

module.exports = function(app) {
    // Note Routes
    app.route('/notes')
        .get(users.requiresLogin, notes.fromUser, notes.fromCourse, notes.fromTag)
        .post(users.requiresLogin,
            multer({
                dest: './uploads/tmp',
                limit: {
                    filesize: 5242880 // 5MB
                },
                onFileSizeLimit: function (file) {
                    fs.unlink('./' + file.path) // delete the partially written file
                    res.status(403).send({
                         message: 'Image size exceeds 5MB. What kind of camera are you using? '
                    });
                }
            }), notes.create);

       // .post(users.requiresLogin, multer({ dest: './uploads/tmp'}), notes.create);

    app.route('/notes/:noteId')
        .get(notes.read)
        .put(users.requiresLogin, notes.hasAuthorization, notes.update)
        .delete(users.requiresLogin, notes.hasAuthorization, notes.delete);

    app.route('/notes/remove_tags/:noteId')
        .put(users.requiresLogin, notes.removeTags);

    app.route('/notes/add_tags/:noteId')
        .put(users.requiresLogin, notes.addTags);

    app.param('noteId', notes.noteById);
};
