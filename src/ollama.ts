import { Ollama } from 'ollama';
import { execFile, ChildProcess, exec } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

// helpers
import { MOR_PROMPT } from './prompts'
import { logger } from './logger';
import { appDataPathPlatform, isDev } from './constants';

// constants
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434/';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// commands
export const SERVE_OLLAMA_CMD = 'ollama serve';
export const WSL_SERVE_OLLAMA_CMD = 'wsl ollama serve';

// ollama instance
let ollama: Ollama;
let ollamaProcess: ChildProcess | null;

export const initOllama = async () => {
  let runningInstance = await isOllamaInstanceRunning();

  if (runningInstance) {
    // connect to local instance
    ollama = new Ollama({
      host: DEFAULT_OLLAMA_URL,
    });

    return true;
  }

  runningInstance = await packedExecutableOllamaSpawn();

  if (runningInstance) {
    // connect to local instance
    ollama = new Ollama({
      host: DEFAULT_OLLAMA_URL,
    });

    return true;
  }

  return false;
};

export const isOllamaInstanceRunning = async (url?: string): Promise<boolean> => {
  try {
    const usedUrl = url ?? DEFAULT_OLLAMA_URL;

    const ping = await fetch(usedUrl);

    return ping.status === 200;
  } catch (err) {
    return false;
  }
};

export const packedExecutableOllamaSpawn = async (customDataPath?: string) => {
  try {
    spawnLocalExecutable(customDataPath);
  } catch (err) {
    console.error(err);
  }

  return await runDelayed(isOllamaInstanceRunning, 10000);
};

export const spawnLocalExecutable = async (customDataPath?: string) => {
  try {
    const { executablePath, appDataPath } = getOllamaExecutableAndAppDataPath(customDataPath);

    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }

    const env = {
      ...process.env,
      OLLAMA_MODELS: appDataPath,
    };

    ollamaProcess = execFile(executablePath, ['serve'], { env }, (err, stdout, stderr) => {
      if (err) {
        throw new Error(`exec error: ${err.message}`);
      }

      if (stderr) {
        throw new Error(`stderr: ${stderr}`);
      }
    });
  } catch (err) {
    logger.error(err);
  }
};

export const getOllamaExecutableAndAppDataPath = (
  customDataPath?: string,
): {
  executablePath: string;
  appDataPath: string;
} => {
  const appDataPath = customDataPath || appDataPathPlatform;
  const executablePath = getExecutablePathByPlatform();

  return {
    executablePath,
    appDataPath,
  };
};

export const askOllama = async (model: string, message: string) => {
  return await ollama.chat({
    model,
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  });
};

export const getOrPullModel = async (model: string) => {
  await installModelWithStatus(model);

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  return findModel(model);
};

export const installModelWithStatus = async (model: string) => {
  const stream = await ollama.pull({
    model,
    stream: true,
  });

  for await (const part of stream) {
    if (part.digest) {
      let percent = 0;

      if (part.completed && part.total) {
        percent = Math.round((part.completed / part.total) * 100);

        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`${part.status} ${percent}%...`);
      }
    } else {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${part.status}`);
    }
  }
};

export const findModel = async (model: string) => {
  const allModels = await ollama.list();

  return allModels.models.find((m) => m.name.toLowerCase().includes(model));
};

export const getAllLocalModels = async () => {
  return await ollama.list();
};

export const stopOllama = async () => {
  if (!ollamaProcess) {
    return;
  }

  killProcess(ollamaProcess);

  ollamaProcess.removeAllListeners();
  ollamaProcess = null;
};

export const runDelayed = async <T>(handler: () => Promise<T>, delayInMs = 3000) => {
  return new Promise((resolve) => setTimeout(resolve, delayInMs)).then(async () => await handler());
};

export const killProcess = (process: ChildProcess) => {
  if (os.platform() === 'win32') {
    exec(`taskkill /pid ${process.pid} /f /t`, (err) => {
      logger.error(err);
    });
  } else {
    process.kill();
  }
};

export const getExecutablePathByPlatform = () => {
  switch (process.platform) {
    case 'win32':
      return isDev
        ? path.resolve(__dirname, 'executables', 'ollama.exe')
        : path.join('executables', 'ollama.exe');
    case 'darwin':
      return isDev
        ? path.join(__dirname, 'executables', 'ollama-darwin')
        : path.join('executables', 'ollama-darwin');
    case 'linux':
      return isDev
        ? path.join(__dirname, 'executables', 'ollama-linux')
        : path.join('executables', 'ollama-linux');
    default:
      throw new Error(`Unsupported platform detected: ${process.platform}`);
  }
}