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
  - Testing:
    - Please use the following `.env` values for testing the Discord bot & server:
      ```
      DISCORD_TOKEN=NDU4NDQwODg0MzMwMTY4MzM0.Dgnr3g.2kzaSfq7E4848w51xIsV3FuZmeY
      MONGODB_URI=[set up locally and enter URI here]
      AUTH_KEY=test
      ```
    - Use [this link](https://discord.gg/UE8ZMgr) to join the *TESTING* Discord server
    - To run in testing mode:
      ```
      nodemon
      ```
#### 2. [Data Tools](https://github.com/zanedb/hackchicago/blob/master/data-tools/README.md): converts data, uploads it, and manipulates it (i.e. counting referrals)
  - Please see [the full README](https://github.com/zanedb/hackchicago/blob/master/data-tools/README.md) for more information.
#### 3. **[WIP]** Checkin System: checks in attendees for the event, food, etc.
  - Currently being moved here & updated to use the new API