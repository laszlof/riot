
riot=./compiler/cli.js

test: riot
	@ $(riot) test/test.htm

demo: riot
	@ $(riot) demo/todo.htm

riot:
	@echo "!function() {" > riot.js
	@cat lib/* >> riot.js
	@echo "}()" >> riot.js
	@echo wrote riot.js

min: riot
	uglifyjs riot.js --mangle > riot.min.js

.PHONY: test demo