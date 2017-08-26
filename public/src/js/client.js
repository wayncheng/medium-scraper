console.log('client.js loaded');

$('.save-item').on('click',function(e){
	e.preventDefault();

	var $t = $(this);
	var $feedItem = $t.parents('.feed-item');
	var mongoID = $feedItem.attr('data-mongodb-id');
	// State Change
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

//==================================================
$('#close-section').on('click', closeCommentsSection);
//==================================================
// Toggle Comments Section
$('.toggle-comments').on('click',function(e){
	e.preventDefault();
	var $root = $(this).parents('.feed-item');
	var itemID = $root.attr('data-mongodb-id');
	
	var $commentsSection = $('#comments-section');
	var $commentsSection = $('#comments-section').attr('data-mongodb-id', itemID);
	var isActive = $commentsSection.hasClass('active');

	// If it is active, close the comments
	// hide the comments section, adjust styling
	if(isActive){
		closeCommentsSection;
		// $commentsSection.removeClass('active');
	}
	else {
		$commentsSection.addClass('active');
		
		// Make call to database to get comments =========
		$.ajax({
			type: 'GET',
			url: '/api/comments/'+itemID
		}).done(function(commentsArray){
			console.log('commentsArray',commentsArray);
			for (var i = 0; i < commentsArray.length; i++) {
				var commentText = commentsArray[i];
				buildComment(commentText);
			}
		})
	}
})
//==================================================
$('.remove-comment').on('click', function(e){
	e.preventDefault();
	console.log('remove-comment clicked');
	console.log('$(this)',$(this));
	var $comment = $(this).parents('.comment');
	var commentID = $comment.attr('data-comment-id');
	console.log('commentID',commentID);

	$.ajax({
		type: 'GET',
		url: '/api/remove/'+commentID
	}).done(function(r){
		console.log('r',r);
		$comment.remove();
	})
});
//==================================================
$('#submit-comment').on('click',function(e){
	e.preventDefault();
	var commentText = $('textarea').val().trim();
	var id = $('#comments-section').attr('data-mongodb-id');
	var postData = {
		_id: id,
		commentText: commentText
	}
	$.ajax({
		type: 'POST',
		url: '/api/submit-comment',
		data: postData
	}).done(function(res){
		console.log('comment submitted');
		console.log('res',res);
		
		$('textarea').val('');
		buildComment(commentText, res);
	});
});

//==================================================
function buildComment(commentText, commentID){
	var $newComment = $('<div/>');
		$newComment.addClass('comment notification is-primary');
		
	var $p = $('<p/>').addClass('comment-text');
		$p.text(commentText);
		
	var $closeIcon = $('<i/>').addClass('fa fa-window-close');
	var $closeLink = $('<a/>').addClass('remove-comment');
		$closeLink.attr('data-comment-id', commentID);
		$closeLink.on('click', function(e){
			e.preventDefault();
			console.log('remove-comment clicked');
			console.log('$(this)',$(this));
			var $comment = $(this).parents('.comment');
			var commentID = $comment.attr('data-comment-id');
			console.log('commentID',commentID);
		
			$.ajax({
				type: 'GET',
				url: '/api/remove/'+commentID
			}).done(function(r){
				console.log('r',r);
				$comment.remove();
			})
		});
	$closeLink.append($closeIcon);

	$newComment.append($p);
	$newComment.append($closeLink);
	$('#posted-comments').append($newComment);
}
//==================================================
function closeCommentsSection(e){
	e.preventDefault();
	console.log('closing comments...');
	$('#comments-section').removeClass('active');
	$('#comments-section').attr('data-mongodb-id','');
	$('#comments-section').empty();
}
