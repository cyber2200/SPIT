<?php
class Issues
{	
	protected $dbh;
	
	public function __construct()
	{
		$xmlConfigPath = dirname(dirname(dirname(__DIR__))) . '/config.xml';
		$xmlTxt = file_get_contents($xmlConfigPath);
		$xmlConfigObj = new SimpleXMLElement($xmlTxt);	
		$dsn = 'mysql:host='. $xmlConfigObj->db->dbHost .';dbname=' . $xmlConfigObj->db->dbName;
		$dbUser = $xmlConfigObj->db->dbUser;
		$dbPassword = $xmlConfigObj->db->dbPassword;	
		try
		{
			$this->dbh = new PDO($dsn, $dbUser, $dbPassword);
			$this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
		catch (PDOException $ex)
		{
			echo $ex->getMessage();
		}
	}
	
	public function insertNewIssue($params)
	{
		$sql ="INSERT INTO `issues` SET
									`type` = '". $params['type'] ."',
									`reporter` = '". $params['reporter'] ."',
									`title` = '". base64_decode($params['title']) ."',
									`description` = '". nl2br(base64_decode($params['description'])) ."',
									`priority` = '". $params['priority'] ."',
									`status` = 'New';";
		try
		{
			$query = $this->dbh->query($sql);
		}
		catch (PDOException $ex)
		{
			echo $ex->getMessage();
		}
		return $sql;
	}
	
	public function getIssues()
	{
		$sql = "SELECT *, DATE_FORMAT(`ts`, '%d.%m.%Y %H:%i:%s') as `ts` FROM `issues` ORDER BY `ts` DESC;";
		$sth = $this->dbh->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
		$sth->execute();
		$res = $sth->fetchAll();
		foreach ($res as &$row)
		{
			$row['title'] = htmlspecialchars($row['title']);
			$row['description'] = htmlspecialchars($row['description']);
		}
		return json_encode($res);
	}
	
	public function deleteIssue($issueId)
	{
		$sql = "DELETE FROM `issues` WHERE `id` = '". $issueId ."';";
		$sth = $this->dbh->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
		$sth->execute();
	}
	
	public function getIssue($issueId)
	{
		$sql = 'SELECT * FROM `issues` WHERE `id` = ' . $issueId;
		$sth = $this->dbh->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
		$sth->execute();
		$res = $sth->fetchAll();
		$res[0]['title'] = htmlspecialchars($res[0]['title']);
		$res[0]['description'] = htmlspecialchars($res[0]['description']);
		return json_encode($res);		
	}
	
	public function updateStatus($issueId, $status)
	{
		$sql = "UPDATE `issues` SET `status` = '". $status ."' WHERE `id` = '". $issueId ."';";
		$sth = $this->dbh->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
		$sth->execute();	
		return $sql;
	}
}