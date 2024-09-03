# Lệnh để chạy ứng dụng

docker run -d -p 8080:8080 --name sandsticket-websocket truongtran0813/sandsticket-websocket:latest

# Lệnh để build ứng dụng

docker build -t truongtran0813/sandsticket-websocket:latest .

# Lệnh để push ứng dụng

docker push truongtran0813/sandsticket-websocket:latest

# Lệnh gán tag

docker tag truongtran0813/sandsticket-websocket:latest truongtran0813/sandsticket-websocket:latest
