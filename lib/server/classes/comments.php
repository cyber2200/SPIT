<?php
class Comments
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
		}
		catch (PDOException $ex)
		{
			echo $ex->getMessage();
		}
	}
	
	public function insertNewComment($params)
	{
		$sql ="INSERT INTO `comments` SET
									`issueId` = '". $params['issueId'] ."',
									`name` = '". $params['name'] ."',
									`comment` = '". nl2br(base64_decode($params['comment'])) ."'";
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
	
	public function getComments($issueId)
	{
		$sql = "SELECT * FROM `comments` WHERE `issueId` = '". $issueId ."' ORDER BY `ts` DESC;";
		$sth = $this->dbh->prepare($sql, array(PDO::ATTR_CURSOR => PDO::CURSOR_FWDONLY));
		$sth->execute();
		$res = $sth->fetchAll();
		foreach ($res as &$row)
		{
			$row['comment'] = htmlspecialchars($row['comment']);
		}
		return json_encode($res);
	}
}