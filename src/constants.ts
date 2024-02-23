export const ASCI_WELCOME_TEXT = 'MorpheusAI \n                                  Node';
export const ASCII_WELCOME_TEXT = `  __  __                  _                       _    ___ \n |  \\/  | ___  _ __ _ __ | |__   ___ _   _ ___   / \\  |_ _|\n | |\\/| |/ _ \\| \'__| \'_ \\| \'_ \\ / _ \\ | | / __| / _ \\  | | \n | |  | | (_) | |  | |_) | | | |  __/ |_| \\__ \\/ ___ \\ | | \n |_|  |_|\\___/|_|  | .__/|_| |_|\\___|\\__,_|___/_/   \\_\\___|\n                   |_|              _   _           _      \n                                   | \\ | | ___   __| | ___ \n                                   |  \\| |/ _ \\ / _\` |/ _ \\\n                                   | |\\  | (_) | (_| |  __/\n                                   |_| \\_|\\___/ \\__,_|\\___|\n                                                           `;
export type MainMenuSelection = 'metamask' | 'chat';
export const WALLET_SELECT_CONFIG = {

};
export const isDev = process.env.MODE === 'development';
export const appDataPathPlatform = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");