import { MetaMaskSDK, MetaMaskSDKOptions } from '@metamask/sdk';
import qrcode from 'qrcode';
import { EthereumChain, LOGO_METAMASK_BASE64, Transaction } from './constants';

export let sdk: MetaMaskSDK;

const options: MetaMaskSDKOptions = {
  shouldShimWeb3: false,
  dappMetadata: {
    name: 'Morpheus Node',
    url: 'https://mor.org',
    base64Icon: LOGO_METAMASK_BASE64,
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

export const connect = async () => {
  sdk.terminate();

  try {
    return await sdk.connect() as Array<string>;
  } catch (err) {
    throw err;
  }
};

export const changeChain = async (chain: EthereumChain) => {
  const provider = sdk.getProvider();

  const chainId = getChainId(chain);

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainId }]
    });

    return true;
  } catch (err) {
    return false;
  }
};

export const sendTx = async (toAddress: string, amount: string) => {
  // build the tx and send request
};

const getChainId = (chain: EthereumChain) => {
  switch (chain) {
    case 'ethereum':
      return '0x1';
    case 'arbitrum':
      return '0xa4b1';
    case 'sepolia':
      return '0xaa36a7';
    case 'holesky':
      return '0x4268';
  }
}