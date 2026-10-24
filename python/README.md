# Irondocs

Run Python code blocks from your markdown docs as real pytest tests. Mark a
fenced block with `test`, and it becomes a runnable assertion — no separate
test file, no boilerplate, no drift between docs and code. Python 3.12+.

## Install

```bash
pip install irondocs
# or
uv add --dev irondocs
```

Irondocs is a pytest plugin: installing it is enough to load it.

## Write a doctest

Add `test` to any `python` fence in any `.md` file. The block runs as one test
named after the nearest preceding heading. Failures read like any pytest
failure, pointing at the line of the `.md` file.

````md
```python test
from statistics import mean

assert mean([1, 2, 3]) == 2
```
````

Untagged `python` blocks render normally and are not run, so you can mix
illustrative snippets and runnable assertions in the same article.

## Wire it into pytest

List the markdown files to collect under `irondocs_files`, and make sure pytest
walks the folder that holds them:

```toml title="pyproject.toml"
[tool.pytest.ini_options]
testpaths = ["tests", "docs"]
irondocs_files = ["docs/*.md"]
```

Run your usual `pytest` — your `.md` files now run alongside your `test_*.py`
files. See [Writing tests](/python/writing-tests/) for the marker syntax,
[Running tests](/python/running-tests/) for what to expect at the terminal, and
[Configuration](/python/configuration/) for the options.
