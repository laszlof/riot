
cli=./compiler/lib/cli.js
riot=test/lib/node-riot.js


current: browser-test

browser-test:
	@ node test gen
	@ node test/lib/browserize

test: node-riot
	@ node test 100

test-compiler:
	@ node compiler/test

# Node version of Riot for testing
node-riot:
	@cat lib/* > $(riot)
	@cat test/lib/nodefy.js >> $(riot)


# browser playground
playground: riot
	@ $(cli) test/playground/test.htm


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