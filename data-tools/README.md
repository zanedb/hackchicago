# data-tools

### There are a few tools here:

#### 1. [`converter.py`](https://github.com/zanedb/hackchicago/blob/master/data-tools/converter.py): converts a CSV file to JSON
  - To run:
    ```
    python data-tools/converter.py -i data-tools/data/attendees.csv -o data-tools/data/attendees.json -f pretty
    ```
#### 2. [`ref.py`](https://github.com/zanedb/hackchicago/blob/master/data-tools/ref.py): prints the number of referrals each attendee has
  - To run:
    ```
    python data-tools/ref.py -i data-tools/data/attendees.json
    ```
#### 3. [`importer.py`](https://github.com/zanedb/hackchicago/blob/master/data-tools/importer.py): imports a JSON file of attendees into the attendee API **(WIP)**
  - To run:
    ```
    python data-tools/importer.py -i data-tools/data/attendees.json
    ```

### PLEASE NOTE THAT [`attendees.csv`](https://github.com/zanedb/hackchicago/blob/master/data-tools/data/attendees.csv) CONTAINS SAMPLE DATA
