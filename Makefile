HEAD_REV=$(shell git rev-parse HEAD)

all: update build

setup:
	npm install -g pug-cli
	npm install

update:
	npm install
	npm update

build: build/index.html build/schedule.html build/hardware.html build/images build/css build/js

build/index.html: index.pug
	pug $< -o ./build

build/schedule.html: schedule.pug
	pug $< -o ./build

build/hardware.html: hardware.pug
	pug $< -o ./build

build/images: images
	rsync -rupE $< build/

build/css: css
	rsync -rupE $< build/

build/js: js
	rsync -rupE $< build/

deploy: build
	rm -rf build/.git
	git -C build init .
	git -C build fetch "git@github.com:ichealthhack/hub.git" gh-pages
	git -C build reset --soft FETCH_HEAD
	git -C build add .
	if ! git -C build diff-index --quiet HEAD ; then \
		git -C build commit -m "Deploy ichealthhack/hub@${HEAD_REV}" && \
		git -C build push "git@github.com:ichealthhack/hub.git" master:gh-pages; \
		fi
	cd ..

clean:
	rm -rf ./build
