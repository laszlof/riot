
cli=./compiler/cli.js
riot=test/lib/node-riot.js

current: browser

test: node-riot
	@ node test


# Node version of Riot for testing
node-riot:
	@echo "\n/* auto-generated! */\n\nwindow = {}" > $(riot)
	@cat lib/* >> $(riot)
	@cat test/lib/nodefy.js >> $(riot)


# browser playground
browser: riot
	@ $(cli) test/browser/test.htm


# compile demo application
demo: riot
	@ $(cli) demo/todo.htm


# create riot.js
riot:
	@echo "!function() {" > riot.js
	@cat lib/* >> riot.js
	@echo "}()" >> riot.js
	@echo wrote riot.js


min: riot
	uglifyjs riot.js --mangle > riot.min.js


.PHONY: test demo