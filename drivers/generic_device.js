'use strict';

const Homey = require('homey');
const {OAuth2Device} = require('/lib/homey-oauth2app');

module.exports = class GenericDevice extends OAuth2Device {
    async onOAuth2Init() {
        // this.registerCapabilityListener("onoff", async (value) => {
        //     await DeviceApi.setMyDeviceState({on: value});
        // });

        // DeviceApi.on('state-changed', (isOn) => {
        //     this.setCapabilityValue('onoff', isOn).catch(this.trror);
        // });

        await this.migrate();

        // Update data manually every minute
        this.interval = setInterval(() => {
            this.updateData();
        }, 1000 * 60)

        this.updateData();

        // TODO: Implement event listening
        // Example: https://jsfiddle.net/gjx3oshw/13/
    }

    async migrate() {
        const driverCapabilities = this.driver.manifest.capabilities;
        const deviceCapabilities = this.getCapabilities();

        // this.log(driverCapabilities);
        // this.log(this.driver);
        // this.log(deviceCapabilities);

        if (driverCapabilities.length !== deviceCapabilities.length) {
            this.log(`[Device] ${this.getName()} - Add new capabilities =>`, driverCapabilities);

            try {
                driverCapabilities.forEach(c => {
                    if (!this.hasCapability(c)) {
                        this.addCapability(c);
                    }
                });

                await sleep(2000);
            } catch (error) {
                this.error(error)
            }
        }
    }

    async checkStatusIsCondition(args) {
        return parseInt(args.status) === parseInt(this.getCapabilityValue('status'));
    }

    async onOAuth2Deleted() {
        // TODO: Unregister listeners

        clearInterval(this.interval);
    }

    async updateData() {
        this.oAuth2Client.getDevice(this.getData().id)
            .then((device) => {
                if (this.hasCapability('program_id')) {
                    this.setCapabilityValue('program_id', device.state.ProgramID.value_localized).catch((e) => this.t(e, 'Program ID'));
                }

                if (this.hasCapability('status')) {
                    this.setCapabilityValue('status', device.state.status.value_raw).catch(e => this.t(e, 'Status'));
                }

                if (this.hasCapability('status_localized')) {
                    this.setCapabilityValue('status_localized', device.state.status.value_localized).catch(e => this.t(e, 'Status Localized'));
                }

                if (this.hasCapability('program_type')) {
                    this.setCapabilityValue('program_type', device.state.programType.value_localized).catch(e => this.t(e, 'Program Type'));
                }

                if (this.hasCapability('program_phase')) {
                    this.setCapabilityValue('program_phase', device.state.programPhase.value_localized).catch(e => this.t(e, 'Program Phase'));
                }

                if (this.hasCapability('remaining_time')) {
                    this.setCapabilityValue('remaining_time', this.convertArrayToMinutes(device.state.remainingTime)).catch(e => this.t(e, 'Remaining Time'));
                }

                if (this.hasCapability('start_time')) {
                    this.setCapabilityValue('start_time', this.convertArrayToMinutes(device.state.startTime)).catch(e => this.t(e, 'Start Time'));
                }

                if (this.hasCapability('signal_info')) {
                    this.setCapabilityValue('signal_info', device.state.signalInfo).catch(e => this.t(e, 'Signal Info'));
                }

                if (this.hasCapability('signal_failure')) {
                    this.setCapabilityValue('signal_failure', device.state.signalFailure).catch(e => this.t(e, 'Signal Failure'));
                }


                if (this.hasCapability('remote_enable')) {
                    this.setCapabilityValue('remote_enable', device.state.remoteEnable.mobileStart).catch(e => this.t(e, 'Remote Enable'));
                }

                if (this.hasCapability('elapsed_time')) {
                    this.setCapabilityValue('elapsed_time', this.convertArrayToMinutes(device.state.elapsedTime)).catch(e => this.t(e, 'Elapsed Time'));
                }

                if (this.hasCapability('spinning_speed')) {
                    this.setCapabilityValue('spinning_speed', device.state.spinningSpeed.value_raw).catch(e => this.t(e, 'Spinning Speed'));
                }

                if (this.hasCapability('drying_step')) {
                    this.setCapabilityValue('drying_step', device.state.dryingStep.value_localized).catch(e => this.t(e, 'Drying Step'));
                }

                if (this.hasCapability('eco_feedback')) {
                    this.setCapabilityValue('eco_feedback', device.state.ecoFeedback ? device.state.ecoFeedback.energyForecast : null).catch(e => this.t(e, 'Eco Feedback'));
                }
            })
            .catch((e) => {
                console.error(e);
            });
    }

    /**
     * Converts an miele array to minutes
     * @param array
     */
    convertArrayToMinutes(array) {
        const hours = parseInt(array[0]) * 60;
        const minutes = parseInt(array[1]);

        if (hours === 0 && minutes === 0) {
            return null;
        }

        return hours + minutes;
    }

    /**
     * Print exception to console and throw
     * @param exception
     * @param type
     */
    t(exception, type) {
        console.error(`${type}: ${exception}`);
        // throw exception;
    }

};
