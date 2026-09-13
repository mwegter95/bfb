/**
 * One place for the details that change.
 */
export const SITE = {
  name: 'Belisle for Birchwood',
  email: 'belisleforbirchwood@gmail.com',
  address: '158 Wildwood Avenue, Birchwood Village, Minn. 55110',
  disclaimer: 'Prepared and paid for by Belisle for Birchwood',

  /**
   * Web3Forms access key — the contact form posts here and Web3Forms
   * relays the message to the address above.
   *
   * Get one free (no account needed) at https://web3forms.com:
   * enter belisleforbirchwood@gmail.com, and they email you a key.
   * Paste it between the quotes. Until then the form stays disabled
   * and the page shows the direct email address instead.
   */
  web3formsKey: 'e569f9eb-5d0b-467a-b44b-9c7b8e1f5b9b',
} as const;

export const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
