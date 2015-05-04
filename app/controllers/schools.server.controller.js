'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    School = mongoose.model('School'),
    s = require('underscore.string'),
    _ = require('lodash');

/**
 * Create a school
 */
exports.create = function(req, res) {
    var school = new School(req.body);

    school.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(school);
        }
    });
};

/**
 * Find school by name. If there is no name defined, let's go to the next method
 */
exports.schoolByName = function(req, res, next) {
    var schoolName = req.query.name;
    if (schoolName){
        var query = {};
        query.name = schoolName;
        School.findOne(query).exec(function(err, school) {
            if (err) return next(err);
            if (!school) return next(new Error('Failed to load school ' + name));
            res.json(school);
        });
    } else {
        next();
    }
};

/**
 * Send back a list of all schools
 */
exports.list = function(req, res) {
    School.find().exec(function(err, schools) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(schools);
        }
    });
};

/**
 * Show specifics for this school.
 * Request should be passed into a middleware before this is invoked
 *
 * @param req.school the school object
 */
exports.read = function(req, res) {
    res.json(req.school);
};


/*********************
 * School middleware *
 *********************/

/**
* Check if the user has access to this school (by using the school email)
*
* @param req.school the school object
* @param req.user the current user trying to access the school
*/
exports.hasAuthorization = function(req, res, next) {
    var school = req.school;
    var user = req.user;
    // If the user's email ends with the school domain, allow access
    if (s.endsWith(user.email, school.domain)) {
        next();
    } else {
        res.status(403).send({
            message: 'User cannot register in ' + school.name + '. Please use a ' + school.domain + ' email address.'
        });
    }
};

/**
 * Middleware to find the school object by ID.
 * Passes it in to the req object for the next method to use
 */
exports.schoolById = function(req, res, next, schoolId) {
    School.findById(schoolId).exec(function(err, school) {
        if (err) return next(err);
        if (!school) return next(new Error('Failed to load school ' + name));
        req.school = school;
        next();
    });
};