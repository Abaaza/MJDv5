# Price Match Versions

This folder contains standalone scripts for matching price list items to inquiry spreadsheets.

- **v0** – Uses both OpenAI and Cohere APIs. Includes `openaipricematcher.py` and `coherepricematcher.py`.
- **v1** – Uses only Cohere via `coherepricematcher.py`.
- **v2** – Adds fuzzy fallback and optional taxonomy columns. Run `python pricematch/v2/coherepricematcher.py` to launch.

Each script provides a simple Tkinter interface to load the inquiry Excel file and output the priced result.
