(function($){
 	$.fn.extend({ 
		
		/**
		* @param {Array<Object>} array of frame objects with height/width properties
		* @param {number} width of the containing element, in pixels
		* @param {number} maximum height of each row of images, in pixels
		* @param {number} spacing between images in a row, in pixels
		* @returns {Array<Array<Object>>} array of rows of resized frames
		*/
 		layoutFrames: function (images, containerWidth, maxRowHeight, spacing) {

 			var layoutFrames = this;

 			layoutFrames.resizeImageFromHeight = function (originalImage, newHeight) {
	 			var originalAspectRatio = originalImage.width / originalImage.height;
	     		var adjustedImage = {
	     			height: newHeight,
	     			width: (originalAspectRatio * newHeight),
	     		};
	     		return adjustedImage;
 			}

 			layoutFrames.calculateRowWidth = function (row, spacing) {
 				var rowWidth = 0;
 				for (var i = 0; i < row.length; i++) {
 					rowWidth = row[i].width + rowWidth;
 					if ((i + 1) < row.length) {
 						rowWidth = rowWidth + spacing;
 					}
 				}
 				return rowWidth;
 			}

 			layoutFrames.singleRowTooBig = function(row, maxWidth, spacing) {
 				rowWidth = this.calculateRowWidth(row, spacing);
 				if (rowWidth > maxWidth) {
 					return true;
 				}
 				else {
 					return false;
 				}
 			}

 			layoutFrames.resizeRowToContainerWidth = function(row, maxWidth, spacing) {
 				while (this.singleRowTooBig(row, maxWidth, spacing)) {
 					var newHeightForRow = row[0].height - 1; // pulling the frame height down by 1px until we hit an optimal solution
 					for (var i = 0; i < row.length; i++) {
 						row[i] = this.resizeImageFromHeight(row[i], newHeightForRow);
 					};
 				}

 				// Only rounding optimal set of widths to prevent false optimals
 				for (var i = 0; i < row.length; i++) {
 					row[i].width = Math.round(row[i].width);
 				};

 				// New row width, which accounts for the rounding done above
 				var rowWidthRounded = this.calculateRowWidth(row, spacing);

 				// Based on the rounded row width, how many pixels didn't we use?
 				var leftOverWidth = Math.round(maxWidth - rowWidthRounded);

 				var r = 0;
 				while (leftOverWidth > 0 && r < (row.length)) {
 					var plusMinusOneToAdd = Math.round(leftOverWidth / (row.length -r));
 					row[r].width = row[r].width + plusMinusOneToAdd;
 					leftOverWidth = leftOverWidth - plusMinusOneToAdd;
 					r++;
 				}

 				return row;
 			}

 			layoutFrames.init = function (images, containerWidth, maxRowHeight, spacing) {
	 			var galleryRows = [];
	 			var singleRow = [];

	 			while (images.length > 0) {
	 				// Check if image greater than max height
	 				var imageInQuestion = images.shift();

	 				// add an image to our new row:
	 				if (imageInQuestion.height >= maxRowHeight) {
	 					var proposedImageSize = this.resizeImageFromHeight(imageInQuestion, maxRowHeight);
	 					singleRow.push(proposedImageSize);
	 				}
	 				else {
	 					singleRow.push(proposedImageSize);
	 				}

	 				// Check if the width's of the images in our row are greater than the container
	 				if (this.singleRowTooBig(singleRow, containerWidth, 10)) {
	 					// scale the images back until they fit perfecly
	 					var rowForContainer = this.resizeRowToContainerWidth(singleRow, containerWidth, 10);
	 					// add the perfect row to our gallery
	 					galleryRows.push(rowForContainer);
	 					// reset singleRow so that we can start building a new row...
	 					singleRow = [];
	 				}
	 			}

	 			// Adding the last row, which may not be the complete width
	 			if (singleRow.length > 0) {
	 				galleryRows.push(singleRow);
	 			}
	 			console.log('***PERECT*** gallery is:');
	 			console.log(galleryRows);

	 			for (var i = 0; i < galleryRows.length; i++) {
	 				console.log('Gallery row #' + i + ' has a width of: ' + this.calculateRowWidth(galleryRows[i], spacing));
	 			};
 			}

 			this.init(images, containerWidth, maxRowHeight, spacing);
    	}
	});
})(jQuery);