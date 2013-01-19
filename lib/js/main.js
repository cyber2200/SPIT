var currentIssueId = 0;

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		
		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}
}

function isInstalled()
{
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=installChceker',
		type : 'POST',
		success : function(ret)
		{
			var objJSON = eval('('+ret+')');
			if (objJSON.message == 'OK')
			{
				getHtml('getMainFormHtml');
				getIssues();
			}
			else
			{
				$('#mainFeeder').html(objJSON.message);
			}
		}
	});
}

function getIssues()
{
	$('#issuesFeeder').html("Loading...");
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=getIssues&rand' + Math.random(),
		type : 'POST',
		success : function(ret)
		{
			var objJSON = eval('('+ret+')');
			var feed = '<table class="table table-striped table-bordered table-condensed">';
			feed += "<tr>";
			feed += "<th>#</th>";
			feed += "<th>Type</th>";
			feed += "<th>Reporter</th>";
			feed += "<th>Title</th>";
			feed += "<th>Priority</th>";
			feed += "<th>Status</th>";
			feed += "<th>TS</th>";
			feed += '<td></td>';
			feed += "</tr>";
			for (var i = 0; i < objJSON.length; i++)
			{
				feed += '<tr>';
				feed += '<td>' + objJSON[i].id + '</td>';
				feed += '<td>' + objJSON[i].type + '</td>';
				feed += '<td>' + objJSON[i].reporter + '</td>';
				feed += '<td>' + objJSON[i].title.substr(0, 60) + '...</td>';
				
				var pTxt = '';
				if (objJSON[i].priority == '2')
					pTxt = "Low";
				if (objJSON[i].priority == '1')
					pTxt = "High";
				if (objJSON[i].priority == '0')
					pTxt = "Critical";
					
				feed += '<td>' + pTxt + '</td>';
				feed += '<td>' + objJSON[i].status + '</td>';
				feed += '<td>' + objJSON[i].ts + '</td>';
				feed += '<td>';
				feed += '<a href="javascript:void(0);" onClick="showIssue('+ objJSON[i].id +')">View</a> ';
				feed += '<a href="javascript:void(0);" onClick="deleteIssue('+ objJSON[i].id +')">Delete</a>';
				feed += '</td>';
				feed += '</tr>';
			}
			feed += '</table>';
			$('#issuesFeeder').html(feed);
		}
	});
}

function submitMainForm()
{
	if ($('#reporter').val() == '' || $('#title').val() == '')
	{
		alert("Missing data");
		return 0;
	}
	var data = '';
	data += '&reporter=' + $('#reporter').val();
	data += '&type=' + $('#type').val();
	data += '&priority=' + $('#priority').val();
	data += '&title=' + Base64.encode($('#title').val());
	data += '&description=' + Base64.encode($('#description').val());
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=insertNewIssue' + data,
		type : 'POST',
		success : function(ret)
		{
			$('#reporter').val('');
			$('#title').val('');
			$('#description').val('');
			hideForm();
			getIssues();
		}
	});
}

function getHtml(func)
{
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=' + func,
		type : 'POST',
		success : function(ret)
		{
			$('#mainFeeder').html(ret);
		}
	});
}

function showIssue(issueId)
{
	currentIssueId = issueId;
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=getIssue&issueId=' + issueId,
		type : 'POST',
		success : function(ret)
		{
			var objJSON = eval('('+ret+')');
			var cont = '';
			cont += '<div style="position: absolute; top: 5px; left: 5px; text-align: left;">';
			cont += '<table>';
			cont += '<tr><td>Task ID:</td><td>' + objJSON[0].id + '</td></tr>';
			cont += '<tr><td>Type:</td><td>' + objJSON[0].type + '</td></tr>';
			cont += '<tr><td>Rporter:</td><td>' + objJSON[0].reporter + '</td></tr>';
			cont += '<tr><td>Title:</td><td>' + objJSON[0].title + '</td></tr>';
			if (objJSON[0].description != '')
				cont += '<tr><td>Description:</td><td>' + objJSON[0].description + '</td></tr>';
			cont += '<tr><td>Status:</td><td>';
			cont += '<select onChange="updateStatus();" name="status" id="status">';
			if (objJSON[0].status == 'New')
			{
				cont += '<option value="New" selected>New</option>';	
			}
			else
			{
				cont += '<option value="New">New</option>';	
			}
			if (objJSON[0].status == 'Dev')
			{
				cont += '<option value="Dev" selected>Dev</option>';	
			}
			else
			{
				cont += '<option value="Dev">Dev</option>';	
			}
			if (objJSON[0].status == 'Testing')
			{
				cont += '<option value="Testing" selected>Testing</option>';	
			}
			else
			{
				cont += '<option value="Testing">Testing</option>';	
			}
			if (objJSON[0].status == 'Closed')
			{
				cont += '<option value="Closed" selected>Closed</option>';	
			}
			else
			{
				cont += '<option value="Closed">Closed</option>';	
			}
			cont += '</select>';
			cont += '</td></tr>';
			cont += '</table>';
			cont += '<br /><br />';
			cont += '<table>';
			cont += '<tr><td>Name:</td><td><input type="text" id="commentName" name="commentName" /></td></tr>';
			cont += '<tr><td>Comment:</td><td><textarea style="height: 80px; width: 420px;" id="comment" name="comment"></textarea></td>';
			cont += '<tr><td></td><td><center><input onClick="addComment();" class="btn btn-primary btn-large" type="submit" value="Add"/></center></td></tr>';
			cont += '</table>';
			cont += '<div id="comments">Loading...</div>';
			cont += '</div>';
			cont += '<div style="position: absolute; top: 5px; right: 5px;"><a onClick="closeIssue();" href="javascript:void();">Close</a></div>';
			$('#modalCont').html(cont);
			$('#modalPos').show();
			getComments(objJSON[0].id);
		}
	});
}

function closeIssue()
{
	currentIssueId = 0;
	$('#modalPos').hide();
}

function deleteIssue(issueId)
{
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=deleteIssue&issueId=' + issueId,
		type : 'POST',
		success : function(ret)
		{
			getIssues();
		}
	});	
}

function addComment()
{
	if ($('#commentName').val() == '' || $('#comment').val() == '')
	{
		alert("Missing data");
		return 0;
	}
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=insertNewComment&issueId=' + currentIssueId + '&name=' + $('#commentName').val() + '&comment=' + Base64.encode($('#comment').val()),
		type : 'POST',
		success : function(ret)
		{
			getComments(currentIssueId);
			$('#commentName').val('');
			$('#comment').val('');
		}
	});
}

function getComments(issueId)
{
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=getComments&issueId=' + issueId,
		type : 'POST',
		success : function(ret)
		{
			var objJSON = eval('('+ret+')');
			var cont = '<table>';
			for (var i = 0; i < objJSON.length; i++)
			{
				cont += '<tr><td><b>'+ objJSON[i].name +'</b></td><td>'+ objJSON[i].comment +'</td></tr>';
			}
			cont += '</table>';
			$('#comments').html(cont);
		}
	});
}

function updateStatus()
{
	$.ajax({
		url : './lib/server/ajax.php',
		data : 'func=updateStatus&issueId=' + currentIssueId + '&status=' + $('#status').val(),
		type : 'POST',
		success : function(ret)
		{
			getIssues();
		}
	});
}

function showForm()
{
	$('#main').show();
}

function hideForm()
{
	$('#main').hide();
}