Docker HTTP Node PDF Watermarker
========================

This image is service used to stamp one PDF as a watermark on each page of another and to
return the resulting PDF using pdftk.

# Deployment using copy of project on repos registry where the image is pre-built

```bash
docker pull paulvisco/docker-node-pdf-watermarker

docker run -d \
    --name pdf-watermarker \
    --restart=always \
    -p 127.0.0.1:9021:9021 \
    -e "port=9021" \
    paulvisco/docker-node-pdf-watermarker
```

# Connecting to the container from the host

```
docker exec -it pdf-watermarker /bin/bash -c "export TERM=xterm; exec bash"
```

# Installing additional commands to debug with apt-get
If you wanted to install nano or telnet from there for debugging
```
apt-get install telnet
apt-get install nano
```

# Using The HTML To PDF Service
To convert HTML to PDF you simply pass mutlipart encoded form data to the service.

The system is looking for a key called html and then one file for each corresponding referenced file. e.g. <img src="@FILE:logo.png"> would require a file named logo.png to be uploaded along with the request

E.g. Any src or href that does not start with @FILE: will cause the service to exit for security purposes.

## Example call from CURL in Bash
This assumes that the docker image was deployed to localhost on port 9021 and that you are in the test directory of this project where there are two files: one named watermark.pdf and another named my.pdf.

```bash
cd test
curl -F "watermark=@watermark.pdf" -F "pdf-to-watermark=@pdf-to-watermark.pdf" http://localhost:9021/watermark > watermarked.pdf
```

## Example call from CURL in PHP
This assumes that the docker image was deployed to localhost on port 9020 and that you are in the test directory of this project where there are two files: one named logo.png and another named styles.css. You can simply run the example.php file in the test directory of this project or use the code below.

```php
<?php
  $ch = curl_init("http://localhost:9021/watermark");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, [
      'watermark' =>  new \CurlFile(__DIR__.'/watermark.pdf','application/pdf','watermark.pdf'),
      'pdf-to-watermark' =>  new \CurlFile(__DIR__.'/pdf-to-watermark.pdf','application/pdf','my.pdf')
  ]);
  $result = curl_exec($ch);
  file_put_contents("watermarked.pdf", $result);
```

# Build and Deploy

If you wanted to build and test this yourself

```bash
docker build --rm -t paulvisco/docker-node-pdf-watermarker .

docker run -d \
    --name pdf-watermarker \
    --restart=always \
    -p 9021:9021 \
    paulvisco/docker-node-pdf-watermarker
```
