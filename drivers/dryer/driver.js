'use strict';

const { OAuth2Driver } = require('/lib/homey-oauth2app');

module.exports = class MieleAtHomeDryerDriver extends OAuth2Driver
{

    async onOAuth2Init()
    {

    }

    async onPairListDevices({ oAuth2Client })
    {
        const things = await oAuth2Client.getDevices();
        const array = Object.values(things);

        // Type ID 2 = Tumble Dryer
        return array.filter(d => d.ident.type.value_raw === 2).map(device => {
            return {
                name: device.ident.type.value_localized,
                data: {
                    id: device.ident.deviceIdentLabel.fabNumber
                },
                store: {
                    "fabNumber": device.ident.deviceIdentLabel.fabNumber,
                    "fabIndex": device.ident.deviceIdentLabel.fabIndex,
                    "techType": device.ident.deviceIdentLabel.techType,
                    "matNumber": device.ident.deviceIdentLabel.matNumber,
                }
            }
        })
    }
};
