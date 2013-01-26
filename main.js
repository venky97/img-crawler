var request = require('request'),

	htmlparser = require("htmlparser");

var webPage = function(url, onComplete) {

	var getSourceWhenImage = function(element) {
		
		if(element.name === 'img' && element.attribs && element.attribs.src) {
			return 	element.attribs.src.trim();
		}
		
	};
	
	var collectImages = function(imageSrcs, elements) {
		
		var i, element, src;
		
		for(i = 0; i < elements.length; i++) {
			
			element = elements[i];
			src = getSourceWhenImage(element);
			
			if(src) {				
				imageSrcs.push(src);
			} else if(element.children) {
				collectImages(imageSrcs, element.children);			
			}
	
		}
		
	};
	
	var getImageSourcesFromBody = function(body) {
	
		var handler = new htmlparser.DefaultHandler(function (error, dom) {
	
			var imageSrcs = [];
	
			collectImages(imageSrcs, dom);								
	
			onComplete(undefined, {srcs: imageSrcs});
	
		});
		
		new htmlparser.Parser(handler).parseComplete(body);
	
	};
	
	var handlePageResponse = function(response, body) {

		switch(response.statusCode) {
			
			case 200: 
				
				getImageSourcesFromBody(body);
				break;
			
			case 404:
	
				onComplete('Page not found');
				break;
				
			default:
			
				onComplete('Received an unsupported response code ' + response.statusCode);
		}
		
	};
	
	var onPageLoaded = function() {
		
		return function(err, response, body) {
			
			if(!err) {
			
				handlePageResponse(response, body);
				
			} else {
			
				onComplete();
			
			}
		};
	};
	
	var loadWebPage = function() {
	
		request(url, onPageLoaded());		
	
	};

	return {
	
		crawl: function() {
			
			loadWebPage();
			
		}
	
	};

};

module.exports.crawl = function(url, callback){

	webPage(url, callback).crawl();

};