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

 			/**
 			* @param originalImage {image object}
 			* @param newHeight {int} the height you want the image to be
 			* @returns {image object} new image object, with the width that maintains the aspect ratio
 			*/
 			layoutFrames.resizeImageFromHeight = function (originalImage, newHeight) {
	 			var originalAspectRatio = originalImage.width / originalImage.height;
	     		var adjustedImage = {
	     			height: newHeight,
	     			width: (originalAspectRatio * newHeight),
	     		};
	     		return adjustedImage;
 			}

 			/**
 			* @param row {Array<Image Object>} takes in an array of images
 			* @param spacing {int} the spacing between each image
 			* @returns {int} the total width of all the images including spacing between images
 			*/
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

 			/**
 			* @param row {Array<Image Object>} takes in an array of images
 			* @param maxWidth {int} the maximum width that the gallery can be
 			* @param spacing {int} the spacing between each image
 			* @returns {bool} returns true if the total row width is longer than the max width. False if it's within it. 
 			*/
 			layoutFrames.singleRowTooBig = function(row, maxWidth, spacing) {
 				rowWidth = this.calculateRowWidth(row, spacing);
 				if (rowWidth > maxWidth) {
 					return true;
 				}
 				else {
 					return false;
 				}
 			}

 			/**
 			* @param row {Array<Image Object>} takes in an array of images
 			* @param maxWidth {int} the maximum width that the gallery can be
 			* @param spacing {int} the spacing between each image
 			* @returns {Array<Image Object>} incrementally reduces the size of the images in the row until it's the max container size 
 			*/
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

 				// Spread out the leftover pixels amongst the images in the row
 				// This results in the aspect ratio being +/- 1ish pixel per image
 				var r = 0;
 				while (leftOverWidth > 0 && r < (row.length)) {
 					var plusMinusOneToAdd = Math.floor(leftOverWidth / (row.length -r));
 					row[r].width = row[r].width + plusMinusOneToAdd;
 					leftOverWidth = leftOverWidth - plusMinusOneToAdd;
 					r++;
 				}

 				return row;
 			}

 			/**
 			
 			*** NOTE: This is basically PART I of UI Challenge ***

 			* @param images {Array<Image Object>} takes in an array of images
 			* @param containerWidth {int} the maximum width that the gallery can be
 			* @param maxRowHeight {int} the maximum height of any image in the gallery
 			* @param spacing {int} the spacing between each image
 			* @returns {Array<Array<Image Object>>} array of arrays, where the 2nd array represents a "row" which
 			  containes the image objects that are in that row
 			*/
 			layoutFrames.determineLayout = function (images, containerWidth, maxRowHeight, spacing) {
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

	 			return galleryRows;
	 		}

	 		/**
 			
 			*** NOTE: This is basically PART II and III of the UI Challenge ***
			It will inject markup into the DOM. Where said markup is our perfectly aligned gallery.

 			* @param images {Array<Image Object>} takes in an array of images
 			* @param containerWidth {int} the maximum width that the gallery can be
 			* @param maxRowHeight {int} the maximum height of any image in the gallery
 			* @param spacing {int} the spacing between each image
 			* @returns {bool = true} @todo: build in some sort of error handling
 			*/
	 		layoutFrames.pageCreate = function (galleryRows) {
	 			var imageContainers = $(this).children('.image'); // take in the users markup (as it has captions and image sources)
	 			var imagesPlaced = 0;
	 			$(this).empty(); // now that we have the users markup (in imageContainers), remove it from the DOM. We'll regenerate better markup below.

	 			// iterate through each gallery row, appending each row to the DOM as we go
	 			for (var r = 0; r < galleryRows.length; r++) {
	 				var singleRow = $('<div class="gallery-row"></div>');
	 				// iterate through each image in a row
	 				for (var i = 0; i < galleryRows[r].length; i++) {
	 					// container for image and caption
	 					var singleImage = $('<div class="resized-image image"></div>');

	 					// get image source and caption text
	 					var imageSrc = $(imageContainers[imagesPlaced]).children('img').prop('src');
	 					var captionText = $(imageContainers[imagesPlaced]).children('.image-caption').text();

	 					// create the image
	 					var imageFrame = $('<img class="image-frame" src="' + imageSrc + '">');
	 					$(imageFrame).css('height', galleryRows[r][i].height); // image-frame width set to 100% via css
	 					$(singleImage).css('width', galleryRows[r][i].width); // force the image's container to the correct width.
	 					
	 					// create the caption
	 					var imageCaption = $('<div class="image-caption">' + captionText + '</div>');

	 					// put the caption and the image in its container
	 					singleImage.append(imageFrame, imageCaption);

	 					// append the entire container to the gallery row
	 					singleRow.append(singleImage);
	 					imagesPlaced++;
	 				}
	 				$(this).append(singleRow);
	 			}


	 			// *** NOTE: This is Phil's PART IV ***
	 			// If the caption is more than 1 line long, shorten it and place "+" tooltip
	 			// When tooltip placed, expand to show the entire caption

	 			// get all of the captions
	 			var captionContainers = $(this).find('.image-caption');
	 			// determine a baseline height (accounting for line height/font changes in CSS)
	 			var firstCaptionContainersText = $(captionContainers[0]).text();
	 			$(captionContainers[0]).text('.'); // "." used for baseline
	 			var singleLineHeight = $(captionContainers[0]).height();
	 			// putting the original caption back...
	 			$(captionContainers[0]).text(firstCaptionContainersText);

	 			// determine which captions need to be shortened
	 			for (var c = 0; c < captionContainers.length; c++) {
	 				if ($(captionContainers[c]).height() > singleLineHeight) {
	 					var captionsHeight = $(captionContainers[c]).height();

	 					// Horrible assumption: If the text wraps to a 2nd line, the text must take up the entire length of both lines
	 					var timesLonger = captionsHeight / singleLineHeight;
	 					var newNumCharacters = ($(captionContainers[c]).text().length / timesLonger) - 6; //minus 5 for the "..." and plus icon
	 					var expandShrinkButton = $('<span class="expand-comment fa fa-plus-circle"></span>');
	 					var fullCommentText = $(captionContainers[c]).text();

	 					// Create new caption markup
	 					var fullCaption = $('<div class="comments-full">' + fullCommentText.substring(newNumCharacters) + '</div>');
	 					$(captionContainers[c]).html('<div style="float: left" class="comments-short">' + fullCommentText.substring(0, newNumCharacters) + '<span class="more-dots">...</span></div>');
	 					$(captionContainers[c]).append(expandShrinkButton);

	 					// Add the new object to the caption container
	 					$(captionContainers[c]).append(fullCaption);
	 				}
	 			}

	 			// give any comment/expand buttons there appropriate triggers
	 			$('.expand-comment').click(function() {
	 				if ($(this).hasClass('fa-plus-circle')) {
	 					$(this).removeClass('fa-plus-circle');
	 					$(this).addClass('fa-minus-circle');
	 					// show the rest of the comment (which is/was display:none below) and hide the "..."
	 					$(this).parent().children('.comments-full').css('display', 'block');
	 					$(this).parent().find('.more-dots').css('display', 'none');
	 				}
	 				else {
	 					$(this).removeClass('fa-minus-circle');
	 					$(this).addClass('fa-plus-circle');
	 					// hide the full comment and put the "..." back
	 					$(this).parent().children('.comments-full').css('display', 'none');
	 					$(this).parent().find('.more-dots').css('display', 'inline-block');
	 				}
	 			})

	 			return true;
 			} // end of pageCreate


 			/**

			NOTE: This initializr basically drives the Part I and Part II & III functions above.
			Through pageCreate, it will put markup into the DOM.

 			* @param images {Array<Image Object>} takes in an array of images
 			* @param containerWidth {int} the maximum width that the gallery can be
 			* @param maxRowHeight {int} the maximum height of any image in the gallery
 			* @param spacing {int} the spacing between each image
 			* @returns {bool = true} @todo: build in error handling
 			*/
 			layoutFrames.init = function (images, containerWidth, maxRowHeight, spacing) {
 				var galleryRows = this.determineLayout(images, containerWidth, maxRowHeight, spacing);
 				this.pageCreate(galleryRows);

 				return true;
 			}

 			// Calling the init so that when we call layoutFrames on an object it renders the gallery
 			this.init(images, containerWidth, maxRowHeight, spacing);

    	} // end of layoutFrames
	});

})(jQuery);