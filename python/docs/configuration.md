---
title: Configuration
path: /python/configuration/
icon: settings
order: 5
description: Wire irondocs into pytest.
---

# Configuration

Irondocs registers itself with pytest through the `pytest11` entry point, so
installing the package is enough to load the plugin. What it collects is up to
one ini option.

## irondocs_files

Glob patterns of the markdown files to collect, matched against each file's
path relative to the rootdir. A pattern without a `/` also matches the file's
basename anywhere. The default is empty: nothing is collected until you opt in.

```toml title="pyproject.toml"
[tool.pytest.ini_options]
testpaths = ["tests", "docs", "README.md"]
irondocs_files = ["README.md", "docs/*.md"]
```

pytest only offers irondocs the files it walks, so the folders that hold your
docs must be in `testpaths` or on the command line. A `.md` file named on the
command line is always collected.

## Imports

Doctests import modules as your test modules do. When the package under test is
not installed, point pytest at it:

```toml title="pyproject.toml"
[tool.pytest.ini_options]
pythonpath = ["src"]
```

## Disabling the plugin

Pass `-p no:irondocs` to run pytest without it.
