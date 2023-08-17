const {OAuth2Client, OAuth2Error} = require('/lib/homey-oauth2app');

module.exports = class MieleAtHomeOAuth2Client extends OAuth2Client {
    static API_URL = 'https://api.mcs3.miele.com/v1/';
    static TOKEN_URL = 'https://api.mcs3.miele.com/thirdparty/token/';
    static AUTHORIZATION_URL = 'https://api.mcs3.miele.com/thirdparty/login/';

    async onHandleNotOK({statusText}) {
        throw new OAuth2Error(statusText);
    }

    getLanguage() {
        const i18n = this.homey.i18n;

        // Homey languages: da, de, en, es, fr, it, nl          sv, no, ru, pl
        // Miele languages: da, de, en, es, fr, it, nl          nb

        // this.log(i18n._language);

        switch (i18n._language) {
            case 'da':
            case 'de':
            case 'en':
            case 'es':
            case 'fr':
            case 'it':
            case 'nl':
                return i18n._language;
            default:
                return 'en';
        }
    }

    async getDevices() {
        return this.get(
            {
                path: 'devices?language=' + this.getLanguage()
            }
        )
    }

    async getDevice(id) {
        return this.get(
            {
                path: 'devices/' + id + '?language=' + this.getLanguage()
            }
        )
    }
};
