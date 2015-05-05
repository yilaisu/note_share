'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
    courses = require('../../app/controllers/courses.server.controller'),
    sections = require('../../app/controllers/section.server.controller');

module.exports = function(app) {
    // Course Routes
    app.route('/sections/fromCourse/:courseId')
        .get(users.requiresLogin, sections.listByCourse);

    app.route('/sections')
        .post(users.requiresLogin, sections.create);

    app.route('/sections/:sectionId')
        .get(users.requiresLogin, sections.read)
        //.put(users.requiresLogin, sections.updateSection)
        .delete(users.requiresLogin, sections.deleteSection);

    app.param('sectionId', sections.sectionById);
    app.param('courseId', courses.courseById);

};
