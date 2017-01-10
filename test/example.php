<?php
  $ch = curl_init("http://localhost:9021/watermark");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, [
      'watermark' =>  new \CurlFile(__DIR__.'/watermark.pdf','application/pdf','watermark.pdf'),
      'pdf-to-watermark' =>  new \CurlFile(__DIR__.'/pdf-to-watermark.pdf','application/pdf','pdf-to-watermark.pdf')
  ]);
  $result = curl_exec($ch);
  file_put_contents("watermarked.pdf", $result);
