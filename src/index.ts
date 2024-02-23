#!/usr/bin/env node

import { yellow } from 'colorette';
import cliSpinners from 'cli-spinners';
import ora from 'ora';
import inquirer from 'inquirer';
import { input } from '@inquirer/prompts';
import select from '@inquirer/select';

// metamask
import { initMetaMask, sdk, connect } from './metamask';

// constants, helpers
import { ASCII_WELCOME_TEXT, MainMenuSelection } from './constants';
import { askOllama, getOrPullModel, initOllama, stopOllama } from './ollama';

// remove experimental warning for fetch (used by internal node_modules)
process.removeAllListeners('warning');

const walletMenu = async () => {
  const selection = await select({
    message: 'What would you like to do?',
    choices: [

    ]
  })
};

const ollamaChat = async () => {
  const question = await input({
    message: `What would you like to know? [type 'exit' to get back to main menu] `
  });

  if (question === 'exit') {
    await mainMenu();

    return;
  }

  const ollamaLoader = ora({ color: 'yellow', spinner: 'dots'}).start();

  const response = await askOllama('llama2', question);

  ollamaLoader.stop();

  console.log(yellow(response.message.content));

  await ollamaChat();
};

const quit = async () => {
  await stopOllama();

  process.exit();
};

const mainMenu = async () => {
  const metamaskOption = !sdk.getProvider().isConnected()
    ? [{ name: 'Connect to MetaMask', value: 'metamask', }]
    : [];

  const selection = await select({
    message: 'What would you like to do?',
    choices: [
      ...metamaskOption,
      {
        name: 'Chat with AI',
        value: 'chat'
      },
      {
        name: 'Quit',
        value: 'quit'
      }
    ]
  }) as MainMenuSelection;

  switch (selection) {
    case 'metamask':
      try {
        const result = await connect();

        console.log(yellow(`Connected with account(s) ${result.join(', ')}`));
        await mainMenu();
      } catch (err) {
        console.log('There was an issue with connecting to MetaMask, retrying...');
      }
      break;
    case 'chat':
      await ollamaChat();
      break;
    default:
      await quit();
      break;
  }
};

const init = async () => {
  await initMetaMask();
  await initOllama();
  await getOrPullModel('llama2');
  await mainMenu();
};

console.log(yellow(ASCII_WELCOME_TEXT));

init();