'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    mongoose = require('mongoose'),
    gm = require('gm'),
    fs = require('fs'),
    courses = require('../../app/controllers/courses.server.controller'),
    Course = mongoose.model('Course'),
    School = mongoose.model('School'),
    Section = mongoose.model('Section'),
    Note = mongoose.model('Note');

/**
 * Get notes by user id, if available. If not, go to the next method.
 *
 * @param req.query.author the ID of an user, requested by the user
 */
exports.fromUser = function(req, res, next) {
    var authorId = req.query.author;
    var query = {};
    query.author = mongoose.Types.ObjectId(authorId);
    if (authorId) {
        Note.find(query).populate('author').populate('course').exec(function(err, note) {
            if (err) return next(err);
            if (!note) return next(new Error('Failed to load note with id ' + authorId));
            res.json(note);
        });
    } else {
        next();
    }
};

/**
 * Get notes by course id, if available. If not, go to the next method.
 *
 * @param req.user.course the ID of a course, requested by the user
 */
exports.fromCourse = function(req, res, next) {
    var courseId = req.query.course;
    var query = {};
    query.course = mongoose.Types.ObjectId(courseId);
    if (courseId) {
        Note.find(query).populate('course').populate('author').exec(function(err, note) {
            if (err) return next(err);
            if (!note) return next(new Error('Failed to load note with id ' + courseId));
            res.json(note);
        });
    } else {
        next();
    }
};

/**
 * Get all notes with given tag, if available. If not specified, then returns all of the
 * current user's notes. If it does not exist, send back an error.
 *
 * @param req.query.tag the string tag representation.
 */
exports.fromTag = function(req, res, next) {
    var givenTag = req.query.tag;
    var query = {};
    query.tags = givenTag;
    if (givenTag) {
        Note.find(query).populate('author').populate('course').exec(function(err, note) {
            if (err) return next(err);
            if (!note) return next(new Error('Failed to load notes with tag ' + givenTag));
            res.json(note);
        });
    } else {
        var defaultUser = {};
        defaultUser.author = mongoose.Types.ObjectId(req.user._id);
        Note.find(defaultUser).populate('author').populate('course').exec(function(err, note) {
            if (err) return next(err);
            if (!note) return next(new Error('Failed to load note with id ' + req.user));
            res.json(note);
        });
    }
};

/**
 * Get a note from the given note id
 *
 * @param req.note the note object
 */
exports.read = function(req, res) {
    res.json(req.note);
};

/**
 * Create a new note
 * @param req.user the current user. Requires log in
 *
 * Uploaded notes will be store at ./uploads/tmp
 * Notes will then be placed in a file path format of:  ./uploads/"school name"/"course code"/"image name"
 *
 *  req NEEDS TO CONTAIN:   file: xxxxxx.xxx <- the actual image
                            type: lecture/tutorial/homework
                            number: 1 (ex: lecture 1/ tutorial 1 / homework)
 *                          sectionId: xxxxx
 *
 */
exports.create = function(req, res) {
    var note = new Note(req.body);
    note.author = req.user;
    note.sectionId = mongoose.Types.ObjectId(req.body.sectionId);

    Section.findById(req.body.sectionId).exec(function(err, section) {
        if (err) return res.status(400).send();
        if (!section) return res.status(400).send({
            message: 'section not found'
        });

            Course.findById(section.course).exec(function(err, course) {
                if (err) return res.status(400).send();
                if (!course) return res.status(400).send({
                    message: 'course not found'
                });

                School.findById(course.school).exec(function(err, school) {
                        if (err) return res.status(400).send();
                        if (!school) return res.status(400).send({
                            message: 'school not found'
                        });

                        /*gm("11bf23a97b389054c4b7424b615c49fa.jpg").res(function(err, value){
                                console.log('resolution: ' + value);
                                console.log(value);
                                console.log(err);
                        })*/

                        console.log(req.files);

                        // check if the extension is correct
                        var matched = matchExtension(req.files.file.extension);
                        if ( matched == false ){
                            return res.status(400).send({
                                message: 'image type is not accepted'
                            });
                        }

                        var fileName = req.files.file.name;
                        var schoolName = school.name.replace(/\W/g, '');
                        var courseCode = course.code.replace(/\W/g, '');
                        var filePath = getFilePath('./uploads/' , schoolName, courseCode , section, fileName);
                        //var thumbNailPath = getThumbNailPath(filePath);

                        // move file from temporary location to file organized by schoolName/courseCode
                        // Image resize
                        moveFile_Resize_Thumbnail( req.files.file, filePath, res);

                        // create new instance of Note
                        var uploadedNote = new Note({
                                name: req.body.name,
                                noteType: req.body.noteType,
                                fileType: req.body.fileType,
                                location: filePath,
                                thumbNail: filePath,
                                author: req.user._id,
                                section: req.body.sectionId,
                        });

                        // save note into mongoose
                        uploadedNote.save(function(err) {
                            if (err) {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                return res.json(uploadedNote);
                            }
                        });
                });
            });
    });
};

function moveFile_Resize_Thumbnail( file, filePath, res ){

    var defaultPath = file.path;
    fs.rename(defaultPath, filePath, function(err){
        if (err) res.json(err);
        if(file.size > 1048576)
            resizeNote(file, filePath);
    });
};

/*   Create path to note if the complete path does not exist yet
 *   prefix by default will be './uploads/'
 *   Create schoolName folder and courseCode folder if they don't already exist
 */
function getFilePath( prefix, schoolName, courseCode, section, fileName){

    var schoolPath = prefix + schoolName;
    var coursePath = schoolPath + '/' + courseCode;
    var sectionYear = coursePath + '/' + section.year;
    var sectionTerm = sectionYear + '/' + section.term;
    var sectionFullPath = sectionTerm + '/' + section.section;

    if (!fs.existsSync(schoolPath)){
        fs.mkdirSync(schoolPath);
    }
    if (!fs.existsSync(coursePath)){
        fs.mkdirSync(coursePath);
    }
    if (!fs.existsSync(sectionYear)){
        fs.mkdirSync(sectionYear);
    }
    if (!fs.existsSync(sectionTerm)){
        fs.mkdirSync(sectionTerm);
    }
    if (!fs.existsSync(sectionFullPath)){
        fs.mkdirSync(sectionFullPath);
    }

    var filePath = sectionFullPath + '/' + fileName;
    return filePath;
};

/*function getThumbNailPath(filePath){


};*/
/*
 *  These are the accepted image extensions
 */
function matchExtension(extension){

    var acceptedExtensions = ['tif','tiff','jpeg','jpg','jif','jfif','jp2','jpx','j2k','j2c','fpx','pcd','png','pdf'];
    if ( acceptedExtensions.indexOf(extension) <= -1 )
        return false;
    else
        return true;
};

function resizeNote(file, filePath){

    /*console.log(filePath);
    gm("./uploads/UniversityofToronto/APS105/99f04d1f241de4e7d2011868075977d9.jpg")
    .resize(240, 240)
    .noProfile()
    .write('./uploads/UniversityofToronto/APS105/resize.png', function (err) {
        if (!err) console.log('done');
    });

    gm(filePath)
    .size(function (err, size) {
      if (!err)
        console.log(size.width > size.height ? 'wider' : 'taller than you');
    });*/

    gm(filePath)
    .resize(360, 240)
    .noProfile()
    .write(filePath, function (err) {
        if (!err) console.log('done');
    });

    gm(filePath)
    .size(function (err, size) {
      if (!err)
        console.log(size.width > size.height ? 'wider' : 'taller than you');
    });

}


/**
 * Update a note (overwrites fields)
 *
 * @param req.note the note object
 */
exports.update = function(req, res) {
    var note = req.note;

    note = _.extend(note, req.body);

    note.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(note);
        }
    });
};

/**
 * Delete a note
 *
 * @param req.note the note object to remove
 */
exports.delete = function(req, res) {
    var note = req.note;

    note.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(note);
        }
    });
};

/**
 * Removes tags from the given note
 *
 * @param req.note the note object  to modify
 */
exports.removeTags = function(req, res) {
    var note = req.note;
    var newTags = req.body.tags;
    newTags = _.difference(note.tags, newTags);
    note.tags = newTags;
    note.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(note);
        }
    });

};

/**
 * Adds tags to the given note
 *
 * @param req.note the note object to modify
 */
exports.addTags = function(req, res) {
    var note = req.note;
    var newTags = req.body.tags;
    newTags = _.union(newTags, req.body.tags);
    note.tags = newTags;

    note.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(note);
        }
    });
};

/**
 * Note authorization middleware; ensures that the user has the appropriate
 * authorization to access the note
 *
 * @param req.note the note object the user is authorizing against
 * @param req.user the current user
 */
exports.hasAuthorization = function(req, res, next) {
    if (req.note.author.id !== req.user.id) {
        return res.status(413).send({
            message: 'User is not authorized'
        });
    }
    next();
};

/**
 * Note middleware
 */
exports.noteById = function(req, res, next, id) {
    Note.findById(id).populate('author').populate('course').exec(function(err, note) {
        if (err) return next(err);
        if (!note) return next(new Error('Failed to load note ' + id));
        req.note = note;
        next();
    });
};
