const path = require('path');
const isDev = true;

function getExecutablePathByPlatform() {
    switch (process.platform) {
        case 'win32':
            return isDev
                ? path.resolve(__dirname, '..', 'executables', 'ollama.exe')
                : path.join('executables', 'ollama.exe');
        case 'darwin':
            return isDev
                ? path.resolve(__dirname, '..', 'executables', 'ollama-darwin')
                : path.join('executables', 'ollama-darwin');
        case 'linux':
            return isDev
                ? path.resolve(__dirname, '..', 'executables', 'ollama-linux')
                : path.join('executables', 'ollama-linux');
        default:
            throw new Error(`Unsupported platform detected: ${process.platform}`);
    }
};

console.log(getExecutablePathByPlatform(), process.platform);