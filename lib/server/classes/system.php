<?php
class System
{
	protected $xmlConfigPath;
	protected $xmlConfigObj;
	protected $dsn;
	protected $dbUser;
	protected $dbPassword;
	protected $dbh;
	
	public function __construct()
	{
		$this->xmlConfigPath = dirname(dirname(dirname(__DIR__))) . '/config.xml';
	}
	
	public function installCheck()
	{	
		$err = '';
		
		if ($this->checkConfigXml() != '')
			$err = $this->checkConfigXml();
		
		if ($this->checkDbConnection() != '')
			$err = $this->checkDbConnection();
		
		if ($err == '')
		{
			if ($this->checkDbTables() != '')
				$err = $this->checkDbTables();
		}
				
		
		if ($err != '')
		{
			return json_encode(array('message' => $err));
		}
		else
		{
			return json_encode(array('message' => 'OK'));
		}
	}
	
	protected function checkConfigXml()
	{
		if (! file_exists($this->xmlConfigPath))
		{	
			return ("Config file not exist in: " . $this->xmlConfigPath);
		}
		elseif (! is_readable($this->xmlConfigPath))
		{
			return ("Config file not readble in: " . $this->xmlConfigPath);
		}
		
		$xmlTxt = file_get_contents($this->xmlConfigPath);
		try
		{
			$this->xmlConfigObj = new SimpleXMLElement($xmlTxt);	
		}
		catch (Exception $err)
		{
			return ("Can't read config XML file in " . $this->xmlConfigPath . ': ' . $err->getMessage());
		}
		
		if (isset($this->xmlConfigObj->db->dbHost)
			&& isset($this->xmlConfigObj->db->dbName)
			&& isset($this->xmlConfigObj->db->dbUser)
			&& isset($this->xmlConfigObj->db->dbPassword))
		{
			$this->dsn = 'mysql:host='. $this->xmlConfigObj->db->dbHost .';dbname=' . $this->xmlConfigObj->db->dbName;
			$this->dbUser = $this->xmlConfigObj->db->dbUser;
			$this->dbPassword = $this->xmlConfigObj->db->dbPassword;	
			return ("");
		}
		else
		{
			return ("Can't find necessary parameters in the XML configuration file: " . $this->xmlConfigPath);
		}
	}
	
	protected function checkDbConnection()
	{
		try 
		{
			$this->dbh = new PDO($this->dsn, $this->dbUser, $this->dbPassword);
		} 
		catch (PDOException $e) 
		{
			return ("DB connection error: " . $e->getMessage());
		}
		return "";
	}
	
	protected function checkDbTables()
	{
		try 
		{
			$this->dbh = new PDO($this->dsn, $this->dbUser, $this->dbPassword);
			$query = $this->dbh->query("SHOW TABLES;");
			$t = array();
			while ($row = $query->fetch())
			{
				$t[] = $row[0];
			}
			
			if (in_array('issues', $t) && in_array('comments', $t))
			{
				return "";
			}
			else
			{
				$query = $this->dbh->query("
				CREATE TABLE IF NOT EXISTS `comments` (
				  `id` int(255) NOT NULL AUTO_INCREMENT,
				  `issueId` int(255) NOT NULL,
				  `name` varchar(255) NOT NULL,
				  `comment` text NOT NULL,
				  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
				  PRIMARY KEY (`id`)
				) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
				");
				$query = $this->dbh->query("
				CREATE TABLE IF NOT EXISTS `issues` (
				  `id` int(255) NOT NULL AUTO_INCREMENT,
				  `type` varchar(255) NOT NULL,
				  `reporter` varchar(255) NOT NULL,
				  `title` text NOT NULL,
				  `description` text NOT NULL,
				  `priority` tinyint(1) NOT NULL,
				  `status` varchar(255) NOT NULL,
				  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
				  PRIMARY KEY (`id`)
				) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;			
				");
				return ("");
			}
		} 
		catch (PDOException $e) 
		{
			return ("DB connection error: " . $e->getMessage());
		}
		return "";		
	}
}