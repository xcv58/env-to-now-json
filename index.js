#!/usr/bin/env node
const dotenv = require('dotenv')
const editJsonFile = require('edit-json-file')
const yargs = require('yargs')

const loadEnvFile = path => {
  const { error, parsed } = dotenv.config({ path })
  if (error) {
    throw error
  }
  return parsed
}

const getSecretName = (key, environment) =>
  key.toLocaleLowerCase() + `_${environment}`

const updateNowSecrets = (variables, environment) => {
  const rm = Object.keys(variables).map(
    x => `now secrets rm ${getSecretName(x, environment)}`,
  )
  const add = Object.entries(variables).map(
    ([key, value]) =>
      `now secrets add ${getSecretName(key, environment)} ${value}`,
  )
  rm.forEach(x => console.log(x))
  add.forEach(x => console.log(x))
}

const getOutputFile = argv => {
  const { environment, output } = argv
  if (output) {
    return output
  }
  if (environment === 'dev') {
    return 'now.json'
  }
  return `now.${environment}.json`
}

const updateNowFile = (output, variables, environment) => {
  const file = editJsonFile(output)
  const env = file.env || {}
  file.set('env',Object.assign({}, env,
    ...Object.keys(variables).map(x => ({ [x]: `@${getSecretName(x, environment)}` }))
  ))
  file.save()
}

yargs.command(
    `$0 [env_file]`,
    'generate now.json config file',
    args => {
      args
        .positional('env_file', {
          alias: 'f',
          describe: 'the input .env file',
          default: '.env',
        })
        .option('environment', {
          alias: 'e',
          describe: 'choose an environment',
          default: 'dev',
          choices: ['dev', 'prod'],
        })
        .option('output', {
          alias: 'o',
          describe: 'output now.json file',
        })
    },
    argv => {
      const { env_file, environment } = argv
      const variables = loadEnvFile(env_file)
      updateNowSecrets(variables, environment)
      updateNowFile(
        getOutputFile(argv),
        variables,
        environment
      )
    },
  )
  .demandCommand()
  .help().argv
