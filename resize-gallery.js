(function($){
 	$.fn.extend({ 
		
		/**
		* @param {Array<Object>} array of frame objects with height/width properties
		* @param {number} width of the containing element, in pixels
		* @param {number} maximum height of each row of images, in pixels
		* @param {number} spacing between images in a row, in pixels
		* @returns {Array<Array<Object>>} array of rows of resized frames
		*/
 		layoutFrames: function(images, containerWidth, maxRowHeight, spacing) {

 			function resizeImageFromHeight (originalImage, newHeight) {
	 			var originalAspectRatio = originalImage.width / originalImage.height;
	     		var adjustedImage = {
	     			height: newHeight,
	     			// width: Math.round(originalAspectRatio * newHeight),
	     			width: (originalAspectRatio * newHeight),
	     		};
	     		return adjustedImage;
 			}

 			function singleRowTooBig (row, maxWidth, spacing) {
 				var rowWidth = 0;
 				// console.log('singleRowTooBig got a row array with x rows:' + row.length);
 				for (var i = 0; i < row.length; i++) {
 					rowWidth = row[i].width + rowWidth;
 				};
 				// console.log('the row is:');
 				// console.log(row);
 				console.log('When we ran singleRowTooBig, the total width was: ' + rowWidth);
 				if (rowWidth > maxWidth) {
 					return true;
 				}
 				else {
 					return false;
 				}
 			}

 			function resizeRowToContainerWidth (row, maxWidth, spacing) {
 				while (singleRowTooBig(row, maxWidth, spacing)) {
 					var newHeightForRow = row[0].height - 1; // pulling the frame height down by 1px
 					for (var i = 0; i < row.length; i++) {
 						row[i] = resizeImageFromHeight(row[i], newHeightForRow);
 					};
 				}
 				return row;
 			}

 			var galleryRows = [];
 			var singleRow = [];

 			while (images.length > 0) {

 			console.log(''); 
 			console.log(''); 
 			console.log(''); 
 			console.log(''); 
 			console.log(''); 
 			console.log(''); 
 			console.log(''); 
 			console.log(''); 
 			console.log('');
 			 

 				// Check if first image greater than max height
 				var imageInQuestion = images.shift();

 				// build row:
 				if (imageInQuestion.height >= maxRowHeight) {
 					var proposedImageSize = resizeImageFromHeight(imageInQuestion, maxRowHeight);
 					singleRow.push(proposedImageSize);
 				}

 				// Check if row is too big
 				if (singleRowTooBig(singleRow, containerWidth, 10)) {
 					console.log('row IS TOO BIG');
 					var rowForContainer = resizeRowToContainerWidth(singleRow, containerWidth, 10);
 					console.log('******--------******--------******--------******')
 					console.log('our row has now been resized, it is PERFECT. The frames are:')
 					console.log(rowForContainer);
 					console.log('******--------******--------******--------******')
 					// adding our "perfect" row to the gallery
 					galleryRows.push(rowForContainer);
 					// resetting single row so that we can start building a new row...
 					singleRow = [];
 				}
 				else {
 					console.log('row is small'); // so stay in this while loop and keep growing...
 				}

 					// // Is new width greater than container?
 					// if (proposedImageSize.width > container) {
 					// 	console.log('width is bigger than container... do something?');
 					// }
 					// else {

 					// 	singleRow.push(proposedImageSize);
 					// }
 			}
 			console.log('FINAL, ***PERECT***, gallery is:');
 			console.log(galleryRows);

 			

    	}
    	
	});
})(jQuery);