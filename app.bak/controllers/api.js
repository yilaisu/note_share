'use strict';

var     request          = require('request'),
        cheerio          = require('cheerio'),
        engRootURL       = 'http://www.apsc.utoronto.ca/Calendars/Current/',
        engListingURL    = 'Course_Descriptions.html',
        artSciRootURL    = 'http://www.artsandscience.utoronto.ca/ofr/timetable/winter/',
        artSciListingURL  = 'sponsors.htm';

exports.getEngCourses = function (callback){
  
  request( engRootURL + engListingURL, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      //Retrieve the course department
	  var courses = [];
	  var $= cheerio.load(body);

	  //process each course
	  $('tr.courseHeader').each(function(){

          var course_info=$(this).children().text().toString();
          var course_code = course_info.substring(0,6);
          var course_length = course_info.substring(9,10);
          var course_name=$(this).children().next().children().text().toString();

		  var course_data = {
			code: course_code,
			name: course_name,
			term: course_length
		  }
		  // push course data into list
		  courses.push(course_data);
	  });
	  callback(courses);
    };
  });
};

exports.getArtSciCourses = function (callback){

    request( artSciRootURL + artSciListingURL, function(error, response, body) {
        if(!error && response.statusCode === 200) {
          //Retrieve the course department
           var $= cheerio.load(body);
           var courses = [];

           var last_department = $('li', '#content').last().children().attr('href').toString();

    	   $('li a', '#content').each( function() {

                var departmentURL = $(this).attr('href').toString();

                // make sure the url is valid
                if( departmentURL.search('.html') == -1 )
                    return true;

                getDepartmentCourses(departmentURL, function(departmentCourses){

                    courses = courses.concat(departmentCourses);

                    if ( departmentURL == last_department){
                        callback(courses);
                    }

                });


           });
        };
    });
};

function getDepartmentCourses (departmentURL, callback){

    request( artSciRootURL + departmentURL, function(error, response, body) {
        if(!error && response.statusCode === 200) {

            var courses = [];
            var $= cheerio.load(body);

            $('tr').each(function() {

                var courseSectionRegex  = new RegExp(/[L][0-9]{4}/),
                    courseCodeRegex     = new RegExp(/[A-Za-z]{3}[0-9]{3}[A-Za-z]{1}[0-9]{1}/),
                    courseTermRegex     = new RegExp(/[F|S|Y]/);

                var currentRow = $(this)
                  , section      = currentRow.children().last()
                  , cellCount    = 0;

                while(!courseSectionRegex.test(section.text().toString()) && cellCount++ < 10) {
                    section = section.prev();
                };

                var courseName      = section.prev(),
                    courseTerm      = section.prev().prev(),
                    courseCode      = section.prev().prev().prev();

                /* Make sure we have valid course data */
                if(courseTermRegex.test(courseTerm.text().toString())  &&
                    courseCodeRegex.test(courseCode.text().toString())  ) {

                    // some course names are two lines
                    // use this to remove the second line
                    courseName = courseName.text().toString();
                    var pos = courseName.search('\r');
                    if( pos != -1 )
                        courseName = courseName.substring(0,pos);
                    pos = courseName.search('\n');
                    if( pos != -1 )
                        courseName = courseName.substring(0,pos);

                    var course_data = {
                        "code": courseCode.text().toString().substring(0,6),
                        "name": courseName,
                        "term": courseTerm.text().toString()
                    }

                    courses.push(course_data);
                };
            });
            callback(courses);
        };
    });
};

function findCourseSection(courseSectionRegex, context) {
  var currentRow = context
  , section      = currentRow.children().last()
  , cellCount    = 0;

  while(!courseSectionRegex.test(section.text().toString()) && cellCount++ < 10) {
    section = section.prev();
  };
  return section;
};
