
cli=./compiler/cli.js
riot=test/node-riot.js


test: node-riot
	@ node test

# Node version of Riot for testing
node-riot: test-tags
	@cat test/build/head.js > $(riot)
	@cat lib/* >> $(riot)
	@cat test/dist/* >> $(riot)
	@cat test/build/tail.js >> $(riot)

# compile test tags
test-tags:
	@ $(cli) test/tags/expr.htm test/dist

# just a playground
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