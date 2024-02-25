#!/usr/bin/env node

import { red, yellow } from 'colorette';
import cliSpinners from 'cli-spinners';
import ora from 'ora';
import inquirer from 'inquirer';
import { input } from '@inquirer/prompts';
import select from '@inquirer/select';

// metamask
import { initMetaMask, sdk, connect, changeChain } from './metamask';

// constants, helpers
import { ASCII_WELCOME_TEXT, EthereumChain, MainMenuSelection } from './constants';
import { askOllama, getOrPullModel, initOllama, stopOllama } from './ollama';

// remove experimental warning for fetch (used by internal node_modules)
process.removeAllListeners('warning');

const ollamaLoader = ora({ color: 'yellow', spinner: 'dots' });

const ollamaChat = async () => {
  const question = await input({
    message: `What would you like to know? [type 'exit' to get back to main menu] `
  });

  if (question === 'exit') {
    await mainMenu();

    return;
  }

  ollamaLoader.start();

  const response = await askOllama('llama2', question);

  ollamaLoader.stop();

  console.log(yellow(response.message.content));

  await ollamaChat();
};

const quit = async () => {
  await stopOllama();

  process.exit();
};

const walletChainMenu = async () => {
  const selection = await select({
    message: 'Which chain would you like to switch to?',
    choices: [
      {
        name: 'Ethereum Main Net',
        value: 'ethereum'
      },
      {
        name: 'Arbitrum',
        value: 'arbitrum'
      },
      {
        name: 'Sepolia Ethereum Test Net',
        value: 'sepolia'
      },
    ]
  }) as EthereumChain;

  switch (selection) {
    case 'ethereum':
    case 'arbitrum':
    case 'sepolia':
      const switched = await changeChain(selection);

      if (switched) {
        console.log(yellow(`Switched to ${selection} succesfully.`));
      } else {
        console.log(red(`There was an error with switching to ${selection}, please try again later.`));
      }

      await walletMenu();
    default:
      throw new Error('Unknown ethereum network');
  }
};

const sendTxMenu = async () => {
  const address = await input({
    message: `Type in address where you would like to send to? [type 'exit' to get back to wallet menu]`
  });

  if (address === 'exit') {
    await walletMenu();
  }

  const amount = await input({
    message: `Type in the amount you'd like to send: [type 'exit' to get back to wallet menu]`
  });

  if (amount === 'exit') {
    await walletMenu();
  }

  // send tx
};

const walletMenu = async () => {
  const selection = await select({
    message: `What would you like to do? [type 'exit' to get back to main menu]`,
    choices: [
      {
        name: 'Send Transaction',
        value: 'send'
      },
      {
        name: 'Change Chain',
        value: 'chain'
      },
      {
        name: 'Back',
        value: 'exit'
      }
    ]
  });

  switch (selection) {
    case 'send':
      await sendTxMenu();
      break;
    case 'chain':
      await walletChainMenu();
      break;
    case 'exit':
      await mainMenu();
      break;
  }
};

const mainMenu = async () => {
  const metamaskOption = !sdk.getProvider().isConnected()
    ? [{ name: 'Connect to MetaMask', value: 'metamask', }]
    : [{ name: 'Wallet Menu', value: 'wallet' }];

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
        console.log(red(`Connection to MetaMask couldn't be established, check your internet connection and try to re-run the application.`));
      }
      break;
    case 'wallet':
      await walletMenu();
      break;
    case 'chat':
      await ollamaChat();
      break;
    default:
      await quit();
      break;
  }
};

export const updateOllamaLoader = (text: string, terminate?: boolean) => {
  if (terminate) {
    ollamaLoader.stop();

    return;
  }

  ollamaLoader.text = text;

  if (!ollamaLoader.isSpinning) {
    ollamaLoader.start();
  }
};

const init = async () => {
  console.log(yellow(ASCII_WELCOME_TEXT));

  await initMetaMask();
  await initOllama();
  await getOrPullModel('llama2');
  await mainMenu();
};

init();