"""Sphinx configuration for dpo-reader documentation."""

from __future__ import annotations

import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath("../src"))

# -- Project information -----------------------------------------------------
project = "dpo-reader"
copyright = f"{datetime.now().year}, Jacob Coffee"
author = "Jacob Coffee"
release = "0.1.0"
version = "0.1.0"

# -- General configuration ---------------------------------------------------
extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "sphinx.ext.intersphinx",
    "sphinx.ext.viewcode",
    "sphinx.ext.napoleon",
    "sphinx_copybutton",
    "sphinx_design",
    "myst_parser",
]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

source_suffix = {
    ".rst": "restructuredtext",
    ".md": "markdown",
}

master_doc = "index"
language = "en"

# -- Extension configuration -------------------------------------------------

napoleon_google_docstring = True
napoleon_numpy_docstring = True
napoleon_include_init_with_doc = True
napoleon_use_param = True
napoleon_use_rtype = True

autodoc_default_options = {
    "members": True,
    "member-order": "bysource",
    "special-members": "__init__",
    "undoc-members": True,
    "show-inheritance": True,
}
autodoc_class_signature = "separated"
autodoc_typehints = "description"

autosummary_generate = True

intersphinx_mapping = {
    "python": ("https://docs.python.org/3", None),
}

myst_enable_extensions = [
    "colon_fence",
    "deflist",
    "fieldlist",
    "tasklist",
    "attrs_inline",
]
myst_heading_anchors = 3

copybutton_prompt_text = r">>> |\.\.\. |\$ "
copybutton_prompt_is_regexp = True
copybutton_remove_prompts = True

# -- HTML output -------------------------------------------------------------
html_theme = "shibuya"
html_title = "dpo-reader"
html_static_path = ["_static"]
html_css_files = ["custom.css"]

html_theme_options = {
    "accent_color": "pink",
    "github_url": "https://github.com/JacobCoffee/dpo-reader",
    "nav_links": [
        {"title": "PyPI", "url": "https://pypi.org/project/dpo-reader/"},
    ],
}
