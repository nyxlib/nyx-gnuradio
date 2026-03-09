<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, reactive, onMounted, onUnmounted} from 'vue';

import ChartJS from 'chart.js/auto';

/*--------------------------------------------------------------------------------------------------------------------*/

const nss = inject('nss');

/*--------------------------------------------------------------------------------------------------------------------*/

const props = defineProps({
    variables1: {
        type: Object,
        required: true,
    },
    enabled: {
        type: Object,
        required: true,
    },
    options: {
        type: Object,
        required: true,
    },
});

/*--------------------------------------------------------------------------------------------------------------------*/

const state = reactive({
    samp_rate: 0.0,
    frequency: 0.0,
    datasets: {},
});

/*--------------------------------------------------------------------------------------------------------------------*/

const canvasEl = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/*--------------------------------------------------------------------------------------------------------------------*/

const decodeFloat32 = (u8) => {

    const aligned = new Uint8Array(u8.length);

    aligned.set(u8);

    return new Float32Array(aligned.buffer);
};

/*--------------------------------------------------------------------------------------------------------------------*/

let chartInstance = null;

const updatePlot = () => {

    if(chartInstance)
    {
        /*------------------------------------------------------------------------------------------------------------*/

        const variables = Object.keys(state.datasets);

        const n = variables.length > 0 ? state.datasets[variables[0]].length : 0;

        if(n === 0)
        {
            return;
        }

        /*------------------------------------------------------------------------------------------------------------*/

        const df = state.samp_rate / n;

        const startFreq = state.frequency - state.samp_rate / 2.0;

        chartInstance.data.labels = Array.from({length: n}, (_, i) => startFreq + i * df);

        /*------------------------------------------------------------------------------------------------------------*/

        chartInstance.options.scales.x.min = startFreq + 0.0000000000000;
        chartInstance.options.scales.x.max = startFreq + state.samp_rate;

        chartInstance.data.datasets = Object.keys(state.datasets).filter((variable) => props.enabled[variable]).map((variable) => ({
            label: variable,
            data: state.datasets[variable],
            borderWidth: 1,
        }));

        chartInstance.update('none');

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const callbacks = {};

for(const variable of props.variables1)
{
    callbacks[variable] = (data) => {

        const array1 = decodeFloat32(data[0x0F0EF2C0]);
        if(array1.length === 1) {
            state.samp_rate = array1[0];
        }

        const array2 = decodeFloat32(data[0x1551E55F]);
        if(array2.length === 1) {
            state.frequency = array2[0];
        }

        const array3 = decodeFloat32(data[0x0092418B]);
        if(array3.length > 0) {
            state.datasets[variable] = array3;
            updatePlot();
        }
    };
}

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    const textColor = getCssVar('--bs-body-color');

    const borderColor = getCssVar('--bs-border-color');

    /*----------------------------------------------------------------------------------------------------------------*/

    chartInstance = new ChartJS(canvasEl.value.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    tension: 0,
                    pointRadius: 0
                },
                point: {
                    radius: 0,
                    hitRadius: 0,
                    hoverRadius: 0
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        color: textColor,
                        text: props.options['x-axis-label']
                    },
                    ticks: {
                        color: textColor,
                    },
                    grid: {
                        color: borderColor,
                    }
                },
                y: {
                    min: props.options['y-min'],
                    max: props.options['y-max'],
                    title: {
                        display: true,
                        color: textColor,
                        text: props.options['y-axis-label']
                    },
                    ticks: {
                        color: textColor,
                    },
                    grid: {
                        color: borderColor,
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                },
            },
            interaction: {
                mode: null
            },
        }
    });

    /*----------------------------------------------------------------------------------------------------------------*/

    console.log('Hello from Frequency Sink');

    for(const variable of props.variables1)
    {
        nss.register(variable, callbacks[variable]);
    }

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    /*----------------------------------------------------------------------------------------------------------------*/

    console.log('Bye from Frequency Sink');

    /*----------------------------------------------------------------------------------------------------------------*/

    for(const variable of props.variables1)
    {
        nss.unregister(variable, callbacks[variable]);
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    chartInstance?.destroy();

    /*----------------------------------------------------------------------------------------------------------------*/
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <canvas class="h-100 w-100" ref="canvasEl"></canvas>

    <!-- *********************************************************************************************************** -->

</template>
