<?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html lang="de" xml:lang="de" xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="x-ua-compatible" content="IE=edge" />
        <meta name="keywords" content="Rostock,Stadtteil,Ortsteil,Stadtteillotse" />
        <meta name="description" content="Stadtteillotse Rostock" />
        <meta name="author" content="Hansestadt Rostock" />
        <title>Stadtteillotse Rostock – Stadtteil- und Begegnungszentren in der Hansestadt Rostock</title>
        <link rel="stylesheet" type="text/css" media="all" href="meta.css" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
    </head>
    <body>
        <div id="head"></div>
        <div id="main">
            <h1>Stadtteil- und Begegnungszentren in der Hansestadt Rostock</h1>
            <?php
                $connection = pg_connect("host=dbnode10.sv.rostock.de dbname=geodaten user=lesen password=selen");
                pg_prepare("", "SELECT bezeichnung, traeger_bezeichnung, strasse_name, hausnummer, hausnummer_zusatz, postleitzahl, regexp_replace(gemeinde_name, e'\,(.*)$', '') AS ort, telefon, fax, email, website FROM regis.begegnungszentren ORDER BY bezeichnung");
                $result = pg_execute("", array());
                pg_close($connection);
                
                while ($row = pg_fetch_assoc($result)) {
                    echo "<div class='content'>";
                    echo "<h2>".$row["bezeichnung"]."</h2>";
                    echo $row["traeger_bezeichnung"]."<br/>";
                    echo $row["strasse_name"]." ".$row["hausnummer"].$row["hausnummer_zusatz"]."<br/>";
                    echo $row["postleitzahl"]." ".$row["ort"]."<br/>";
                    echo "Telefon: ".$row["telefon"]."<br/>";
                    echo "Telefax: ".$row["fax"]."<br/>";
                    echo "E-Mail: <a href='mailto:".$row["email"]."'>".$row["email"]."</a><br/>";
                    echo "<a href='".$row["website"]."' target='_blank'>Website</a><br/>";
                    echo "</div>";
                }
            ?>
        </div>
    </body>
</html>