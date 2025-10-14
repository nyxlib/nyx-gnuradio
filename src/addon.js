/*--------------------------------------------------------------------------------------------------------------------*/

import FrequencySink from './controls/FrequencySink.vue';
import WaterfallSink from './controls/WaterfallSink.vue';

/*--------------------------------------------------------------------------------------------------------------------*/

export default {

    /*----------------------------------------------------------------------------------------------------------------*/

    init(DEFAULT_GLOBALS, addon, addonName)
    {
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    start(addon, addonName)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        addon.registerControl(
            addonName,
            'frequency-sink-control',
            'Frequency Sink',
            'stream',
            [
                {
                    type: 'string',
                    name: 'x-axis-label',
                    label: 'X axis label',
                    defaultValue: 'Frequency [MHz]'
                },
                {
                    type: 'string',
                    name: 'y-axis-label',
                    label: 'Y axis label',
                    defaultValue: 'Power'
                },
                {
                    type: 'number',
                    name: 'y-min',
                    label: 'Y min',
                    defaultValue: -150.0
                },
                {
                    type: 'number',
                    name: 'y-max',
                    label: 'Y max',
                    defaultValue: +10.0
                }
            ],
            FrequencySink
        );

        /*------------------------------------------------------------------------------------------------------------*/

        addon.registerControl(
            addonName,
            'waterfall-sink-control',
            'Waterfall Sink',
            'stream',
            [
                {
                    type: 'string',
                    name: 'x-axis-label',
                    label: 'X axis label',
                    defaultValue: 'Frequency [MHz]'
                },
                {
                    type: 'string',
                    name: 'y-axis-label',
                    label: 'Y axis label',
                    defaultValue: 'Time'
                },
                {
                    type: 'number',
                    name: 'y-min',
                    label: 'Y min',
                    defaultValue: -150.0
                },
                {
                    type: 'number',
                    name: 'y-max',
                    label: 'Y max',
                    defaultValue: +10.0
                }
            ],
            WaterfallSink
        );

        /*------------------------------------------------------------------------------------------------------------*/
    },

    /*----------------------------------------------------------------------------------------------------------------*/

    stop(addon, addonName)
    {
    }

    /*----------------------------------------------------------------------------------------------------------------*/
}

/*--------------------------------------------------------------------------------------------------------------------*/
