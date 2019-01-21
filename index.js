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
      `now secrets add ${getSecretName(key, environment)} "${value}"`,
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

const getOriginEnv = (file, build) => {
  if (!build) {
    return file.env || {}
  }
  if (file.build) {
    return file.build.env || {}
  }
  return {}
}

const updateNowFile = (output, variables, environment, build) => {
  const file = editJsonFile(output)
  const env = getOriginEnv(file, build)
  file.set(build ? 'build.env' : 'env',Object.assign({}, env,
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
          choices: ['dev', 'staging', 'prod'],
        })
        .option('output', {
          alias: 'o',
          describe: 'output now.json file',
        })
        .option('build', {
          alias: 'b',
          describe: 'the env file is for build environment',
          type: 'boolean',
        })
    },
    argv => {
      const { env_file, environment, build } = argv
      const variables = loadEnvFile(env_file)
      updateNowSecrets(variables, environment)
      updateNowFile(
        getOutputFile(argv),
        variables,
        environment,
        build
      )
    },
  )
  .demandCommand()
  .help().argv
