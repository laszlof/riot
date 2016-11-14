
riot=./compiler/cli.js

demo: riot
	@ $(riot) demo/todo.htm

test: riot
	@ $(riot) test/test.htm

riot:
	@echo "!function() {" > riot.js
	@cat lib/* >> riot.js
	@echo "}()" >> riot.js
	@echo wrote riot.js

.PHONY: test demo