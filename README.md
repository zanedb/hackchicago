## Hack Chicago Software
### Complete list of software:

#### 1. [Attendee API & Discord Bot](https://github.com/zanedb/hackchicago/blob/master/app.js): sets up Orpheus bot & handles requests to API (get/edit/create/delete attendees)
  - Prerequisites:
    - There must be a configured Discord bot in the proper server.
    - You must have a MongoDB database configured.
    - You must choose an AUTH_KEY to be used for API calls.
    - Then, a file called `.env` must exist in the root directory, with the following structure (and filled out values):
      ```
      DISCORD_TOKEN=
      MONGODB_URI=
      AUTH_KEY=
      ```
  - To run:
    ```
    yarn && yarn start
    ```
#### 2. [Data Tools](https://github.com/zanedb/hackchicago/blob/master/data-tools/README.md): converts data, uploads it, and manipulates it (i.e. counting referrals)
  - Please see [the full README]() for more information.
#### 3. **[WIP]** Checkin System: checks in attendees for the event, food, etc.
  - Currently being moved here & updated to use the new API