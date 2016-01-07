<?

function debugOn() {
	error_reporting(-1);
}
function debugOff() {
	error_reporting(0);
}

function ip() {
	if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$theip = $_SERVER['HTTP_X_FORWARDED_FOR'];
	}
	else {
		$theip = $_SERVER['REMOTE_ADDR'];
	}
	return trim($theip);
}

function ipmore($ip) {
	if (!$ip) {
		$ip = ip();
	}
	$result["IPv4"] = $ip;
	$result["IPv6"] = ip2long($ip);
	return $result;
}
function agent($o = false) {
	if ($o) {
		ob_start();
	}
	foreach ($_SERVER as $key => $val) {
        $server[strtolower($key) ] = trim(strip_tags($val));
    }
	ksort($server);
	?><table class='server'><? foreach ($server as $key => $val) {
	?><tr><?
	?><th><?= $key ?></th><?
	?><td><?= $val ?></td><?
	?></tr><? }
	?>
	<tr><th>ip</th><td><?= ip() ?></td></tr>
	<tr><th>ipv4</th><td><?= ipmore($ip)["IPv4"] ?></td></tr>
	<tr><th>ipv6</th><td><?= ipmore($ip)["IPv6"] ?></td></tr>
	<?
	?></table><?
	if ($o) {
		$r = ob_get_contents();
		ob_end_clean();
		return $r;
	}
}

$_ = $_POST ?: $_GET;
if (!$_) {
	agent();
	return;
}
extract($_);

if ($debug === true) {
	debugOn();
}
$ip = ip();
switch ($mode) {
	case "write":
		$today = getdate()[0];
		$f = fopen("archive/index-$today-$ip.html", "w+");
		chmod($handle, 0777);
		fwrite($f, $content);
		fwrite($f, agent(true));
		fclose($f);
		$f = fopen($handle, "w+");
		chmod($handle, 0777);
		fwrite($f, $content);
		fclose($f);
		break;
	case "mkdir":
		mkdir($handle) or die($handle . " not created.\n");
		chmod($handle, 0777);
		echo $handle . " created.\n";
		break;
	case "touch":
	case "mk":
		$f = fopen($handle, "w");
		chmod($handle, 0777);
		fclose($f);
		echo $handle . " created.";
	break;
	case "read":
	case "file_get_contents":
		echo file_get_contents($handle);
	break;
	case "count":
		$fi = new FilesystemIterator($handle, FilesystemIterator::SKIP_DOTS);
		echo iterator_count($fi);
	break;

}


if ($debug === true) {
	print_r($_);
}