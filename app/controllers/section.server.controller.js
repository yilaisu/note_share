'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Section = mongoose.model('Section'),
    _ = require('lodash');

/**
 * Send back the course object
 *
 * @param req.course the course object to send back
 */
exports.read = function(req, res) {
    res.json(req.section);
};



/**
 * Lists all sections available by course
 *
 */
exports.listByCourse = function(req, res, next) {

    var courseId = req.course._id;
    var query = {};
    query.course = mongoose.Types.ObjectId(courseId);

    if (courseId){
        Section.find(query).exec(function(err, sections) {
            if (err) return next(err);
            if (!sections) return next(new Error('Failed to load courses with course ' + courseId));
            res.json(sections);
        });
    } else {
        return res.status(403).send({
            message: 'No section under this course'
        });
    }
};


/**
 * Middleware to find the course by ID. Packs the course object into req.course
 *
 */
exports.sectionById = function(req, res, next, id) {
    Section.findById(id).exec(function(err, section) {
        if (err) return next(err);
        if (!section) return next(new Error('Failed to load section ' + id));
        req.section = section;
        next();
    });
};

exports.create = function(req, res) {
      var section = new Section(req.body);

      section.save(function(err) {
          if (err) {
              return res.status(400).send({
                  message: errorHandler.getErrorMessage(err)
              });
          } else {
              res.json(section);
          }
      });
  };


/**
 * addCourse function used in the courses/update REST call
 *

exports.addSection = function(course, school, res, callback){

    // section json object with all course information
    var sectionToAdd = new Section({
        name: section.namee,
        code: section.code,
        term: section.term,
        school: school._id
    });

    // setup query object
    var query = {};
    query.name = course.name;
    query.code = course.code;

    // if the course is not in database, add it in
    // else just return directly
    Course.find(query).exec(function(err, courses) {
        if (err) return next(err);
        if (!courses) {
            saveCourse(courseToAdd, function(saved){
                callback();
                console.log('added course' + courseToAdd);
            });
        }
        else
            callback();
    });
};*/

exports.deleteSection = function(req, res){

    console.log("in delete")
    var section = req.section;

    section.remove(function(err) {
        if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(section);
		}
    });
}


exports.create = function(req, res) {

    console.log(req.body);
    var section = new Section(req.body);

    section.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(section);
        }
    });
};

function saveSection(section, callback){

    section.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else{
            callback();
        }
    });

};
