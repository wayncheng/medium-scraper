console.log('client.js loaded');

$('.save-item').on('click',function(e){
	e.preventDefault();

	var $t = $(this);
	var $feedItem = $t.parents('.feed-item');

	// Get data from feed item
	var feedItemData = {
		title: $feedItem.find('.article-title').text(),
		link: $feedItem.find('.link-wrap').attr('href'),
		author: $feedItem.find('.author').text(),
		author_profile: $feedItem.find('.author').attr('href'),
		date: $feedItem.find('.publication_date').text()
	}
	console.log('feedItemData',feedItemData);

	// State Change
	var isSaved = $t.hasClass('saved');
	if (!isSaved) {
		console.log('!isSaved --> saving to db');
		$t.addClass('saved');
		
		$.ajax({
			type: "POST",
			data: feedItemData,
			url: '/save'
		}).done(function(res){
			console.log('res',res);
		})
	}
	else if (isSaved){
		console.log('isSaved --> removing from db');
		$t.removeClass('saved');

	}
	
	})