<?php
  $ical = $_GET["data"];
  header('Content-type: text/calendar; charset=utf-8');
  header('Content-Disposition: attachment; filename=event.ics');
  echo $ical;
  exit;
?>
