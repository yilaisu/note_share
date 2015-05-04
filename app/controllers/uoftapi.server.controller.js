'use strict';

var   api          = require('./api.js'),
      courses      = require('../../app/controllers/courses.server.controller');

/* addCourses will add all courses to the schoolId passed in
 * However, getAllCourses only gets all the uoft courses
 * This should be fixed if we launch other schools
 */
exports.addCourses = function(req , res){

    getAllCourses( function(allCourses){
        // Loops through the array allCourses and process one by one
        asyncForLoop(req, res, allCourses.shift(), allCourses);
    });
};

function asyncForLoop(req, res, course, allCourses){

    // If course item exist add it in
    if (course){
        courses.addCourse(course, req.school, res, function(){
            return asyncForLoop(req, res, allCourses.shift(), allCourses);
        });
    }
    // else the allCourses array is empty. We're done processing all courses.
    else{
        return res.status(400).send({
            message: 'Course database updated'
        });
    }
};

function getAllCourses( callback ){

    api.getEngCourses( function(engCourses){
        api.getArtSciCourses( function(artSciCourses) {
            // concatenate all engineering and art sci courses
            var allCourses =  engCourses.concat(artSciCourses);
            callback(allCourses);
        });
    });
};

