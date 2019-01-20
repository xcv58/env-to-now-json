# env-to-now-json

Convert .env file to now.json

## Install

```
npm i -g env-to-now-json
```

or

```
yarn global add env-to-now-json
```

## Usage

```
env-to-now-json --help

env-to-now-json [env_file]

generate now.json config file

Positionals:
  env_file, f  the input .env file                             [default: ".env"]

Options:
  --version          Show version number                               [boolean]
  --help             Show help                                         [boolean]
  --environment, -e  choose an environment
                                       [choices: "dev", "staging", "prod"] [default: "dev"]
  --output, -o       output now.json file
```
