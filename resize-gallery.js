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
 					row[i].width = Math.floor(row[i].width);
 				};

 				// New row width, which accounts for the rounding done above
 				var rowWidthRounded = this.calculateRowWidth(row, spacing);

 				// Based on the rounded row width, how many pixels didn't we use?
 				var leftOverWidth = Math.floor(maxWidth - rowWidthRounded);

 				var r = 0;
 				while (leftOverWidth > 0 && r < (row.length)) {
 					var plusMinusOneToAdd = Math.floor(leftOverWidth / (row.length -r));
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

	 			// start remove this, debugging only
	 			console.log('***PERECT*** gallery is:');
	 			console.log(galleryRows);

	 			for (var i = 0; i < galleryRows.length; i++) {
	 				console.log('Gallery row #' + i + ' has a width of: ' + this.calculateRowWidth(galleryRows[i], spacing));
	 			};
	 			// end remove 

	 			// start of part 2

	 			var imageContainers = $(this).children('.image');
	 			var imagesPlaced = 0;
	 			$(this).empty();

	 			for (var r = 0; r < galleryRows.length; r++) {
	 				var singleRow = $('<div class="gallery-row"></div>');
	 				for (var i = 0; i < galleryRows[r].length; i++) {
	 					var singleImage = $('<div class="resized-image image"></div>');
	 					var imageSrc = $(imageContainers[imagesPlaced]).children('img').prop('src');
	 					var imageFrame = $('<img class="image-frame" src="' + imageSrc + '">');
	 					$(imageFrame).css('height', galleryRows[r][i].height);
	 					var captionText = $(imageContainers[imagesPlaced]).children('.image-caption').text();
	 					var imageCaption = $('<div class="image-caption">' + captionText + '</div>');
	 					singleImage.append(imageFrame, imageCaption);
	 					$(singleImage).css('width', galleryRows[r][i].width);
	 					singleRow.append(singleImage);
	 					imagesPlaced++;
	 				}
	 				$(this).append(singleRow);
	 			}

	 			// cut off the captions and add the expand button
	 			var captionContainers = $(this).find('.image-caption');
	 			// getting a baseline height
	 			var firstCaptionContainersText = $(captionContainers[0]).text();
	 			$(captionContainers[0]).text('.'); //setting as 1 character, thus allowing us to get the natural height
	 			var singleLineHeight = $(captionContainers[0]).height();
	 			// putting the caption back...
	 			$(captionContainers[0]).text(firstCaptionContainersText);
	 			for (var c = 0; c < captionContainers.length; c++) {
	 				if ($(captionContainers[c]).height() > singleLineHeight) {
	 					var captionsHeight = $(captionContainers[c]).height();
	 					var timesLonger = captionsHeight / singleLineHeight;
	 					var newNumCharacters = ($(captionContainers[c]).text().length / timesLonger) - 5; //minus 5 for the "..." and plus icon
	 					console.log('new number of characters:' + newNumCharacters);
	 					var expandShrinkButton = $('<span class="expand-comment fa fa-plus-circle"></span>');
	 					var fullCommentText = $(captionContainers[c]).text();
	 					var fullCaption = $('<div class="comments-full">' + fullCommentText.substring(newNumCharacters) + '</div>');
	 					$(captionContainers[c]).html('<div style="float: left" class="comments-short">' + fullCommentText.substring(0, newNumCharacters) + '<span class="more-dots">...</span></div>');
	 					$(captionContainers[c]).append(expandShrinkButton);
	 					$(captionContainers[c]).append(fullCaption);
	 				}
	 			}
	 			// show / hide the rest of the comment on click...
	 			$('.expand-comment').click(function() {
	 				if ($(this).hasClass('fa-plus-circle')) {
	 					$(this).removeClass('fa-plus-circle');
	 					$(this).addClass('fa-minus-circle');
	 					$(this).parent().children('.comments-full').css('display', 'block');
	 					$(this).parent().find('.more-dots').css('display', 'none');
	 				}
	 				else {
	 					$(this).removeClass('fa-minus-circle');
	 					$(this).addClass('fa-plus-circle');
	 					$(this).parent().children('.comments-full').css('display', 'none');
	 					$(this).parent().find('.more-dots').css('display', 'inline-block');
	 				}
	 			})

 			}

 			this.init(images, containerWidth, maxRowHeight, spacing);
    	}
	});
})(jQuery);