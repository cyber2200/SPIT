<?php
include './classes/system.php';
include './classes/issues.php';
include './classes/comments.php';

$system = new System();
$issues = new Issues();
$comments = new Comments();

if ($_POST['func'] == 'installChceker')
{
	echo($system->installCheck());
}
elseif ($_POST['func'] == 'getMainFormHtml')
{
	echo file_get_contents('./templates/mainForm.html');
}
elseif ($_POST['func'] == 'insertNewIssue')
{
	echo $issues->insertNewIssue($_POST);
}
elseif ($_POST['func'] == 'getIssues')
{
	echo($issues->getIssues());
}
elseif ($_POST['func'] == 'deleteIssue')
{
	echo($issues->deleteIssue($_POST['issueId']));
}
elseif ($_POST['func'] == 'getIssue')
{
	echo($issues->getIssue($_POST['issueId']));
}
elseif ($_POST['func'] == 'insertNewComment')
{
	echo($comments->insertNewComment($_POST));
}
elseif ($_POST['func'] == 'getComments')
{
	echo($comments->getComments($_POST['issueId']));
}
elseif ($_POST['func'] == 'updateStatus')
{
	echo $issues->updateStatus($_POST['issueId'], $_POST['status']);
}
?>
