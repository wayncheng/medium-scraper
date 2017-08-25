console.log('client.js loaded');

$('.save-item').on('click',function(e){
	e.preventDefault();

	var $t = $(this);
	var $feedItem = $t.parents('.feed-item');
	var mongoID = $feedItem.attr('data-mongodb-id');
// 	// Get data from feed item
// 	// var feedItemData = {
// 	// 	title: $feedItem.find('.article-title').text(),
// 	// 	link: $feedItem.find('.link-wrap').attr('href'),
// 	// 	author: $feedItem.find('.author').text(),
// 	// 	author_profile: $feedItem.find('.author').attr('href'),
// 	// 	date: $feedItem.find('.publication_date').text()
// 	// }
// 	// console.log('feedItemData',feedItemData);

// 	// State Change
	// var isSaved = $t.hasClass('saved');
	var saveStatusAttr = $t.attr('data-save-status');
	var newSaveState;

	if (saveStatusAttr === 'false') {
		console.log('not saved --> saving to db');
		// $t.addClass('saved');
		$t.attr('data-save-status', 'true');
		newSaveState = true;
	}
	else if (saveStatusAttr === 'true'){
		console.log('already saved --> removing from db');
		// $t.removeClass('saved');
		$t.attr('data-save-status','false');
		newSaveState = false;
	}

		$.ajax({
			type: "POST",
			url: '/api/save',
			data: { 
				_id: mongoID,
				saved: newSaveState 
			}
		}).done(function(res){
			// console.log('res',res);
			console.log('save status updated');
		})

		
	
	
})