import { MetaMaskSDK, MetaMaskSDKOptions, SDKProvider } from '@metamask/sdk';
import { red } from 'colorette';
import qrcode from 'qrcode';

export let sdk: MetaMaskSDK;

const options: MetaMaskSDKOptions = {
  shouldShimWeb3: false,
  dappMetadata: {
    name: 'Morpheus Node'
  },
  useDeeplink: true,
  communicationServerUrl: 'https://metamask-sdk-socket.metafi.codefi.network/',
  logging: {
    sdk: false,
    developerMode: false,
    eciesLayer: false,
    keyExchangeLayer: false,
    serviceLayer: false,
    plaintext: false,
    remoteLayer: false
  },
  checkInstallationImmediately: false,
  modals: {
    install: ({ link }) => {
      qrcode.toString(link, (err, qr) => {
        console.log(qr)
        console.log(`Please scan the QR code with your MetaMask app.`)
      });

      return {};
    },
    otp: () => {
      return {
        mount() { },
        updateOTPValue: (otpValue) => {
          if (otpValue !== '') {
            console.debug(
              `[CUSTOMIZE TEXT] Choose the following value on your metamask mobile wallet: ${otpValue}`,
            );
          }
        },
      };
    },
  },
};

export const initMetaMask = async () => {
  sdk = new MetaMaskSDK(options);

  return await sdk.init();
};

export const connect = async (retry: boolean = false) => {
  sdk.terminate();

  let accounts: Array<string>;

  try {
    accounts = await sdk.connect() as Array<string>;

    return accounts;
  } catch (err) {
    if (retry) {
      console.log(red(`Connection to MetaMask couldn't be established, check your internet connection and try to re-run the application.`));
    }

    throw err;
  }
}