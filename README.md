# sample_nodejs
```
npx express-generator --view=ejs
```
```
npm i
```
- Additional packages
```
npm i express-ejs-layouts
npm i mysql
npm i bcrypt
npm i mysql2
npm i express-session
npm i winston
npm i moment
npm i node-cron
npm i joi
```
- Migrations
```
node com migrate 
<p style='color:red'>Migrate all.</p>
node com migrate users sessions 20240202181225186-settings ...  <Migrate (all)users, (all)sessions (current settings)20240202181225186-settings ... by sequence.>
node com make:migration table1 table2 ...  <Make a table1, table2 ... migration(s) skeleton file(s).>
```
- Seeders
```
node com seed     <Seed all.>
node com seed table1 20240202181225186-table2 ...   < Seed (all)table1, (current table2)20240202181225186-table2 ... by sequence.>
node com make:seeder table1 table2 ...   < Make a table1, table2 ... seeder(s) skeleton file(s).>
```
- Commands
```
node com make:command command1 command2 ...   <Make a command(s) skeleton file(s).>
node com command1 argument1 argument2 ...  <run command1 with arguments.>
```
- Others
```
node com make:controller controller1 controller2 ...   <Make a controller(s) skeleton file(s).>
node com make:resource resource1 resource2 ...    <Make a resource(s) skeleton file(s).>
node com make:notification notification1 notification2 ... <Make a notification(s) skeleton file(s).>
```
