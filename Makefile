proxyup:
	@read -p "Enter proxy target: " userInput && \
	cd "$$userInput" && \
    docker build -t "$$userInput""-proxy:0.1" . && \
	docker-compose up -Vd "$$userInput" && \
	docker-compose logs -f --tail 5  "$$userInput"