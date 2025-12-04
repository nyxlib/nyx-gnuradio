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

const canvasRef = ref(null);

/*--------------------------------------------------------------------------------------------------------------------*/

const decodeFloat32 = (u8) => {

    const aligned = new Uint8Array(u8.length);

    aligned.set(u8);

    return new Float32Array(aligned.buffer);
};

/*--------------------------------------------------------------------------------------------------------------------*/

let chart = null;

const updatePlot = () => {

    if(chart)
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

        chart.data.labels = Array.from({length: n}, (_, i) => startFreq + i * df);

        /*------------------------------------------------------------------------------------------------------------*/

        chart.options.scales.x.min = startFreq + 0.0000000000000;
        chart.options.scales.x.max = startFreq + state.samp_rate;

        chart.data.datasets = Object.keys(state.datasets).filter((variable) => props.enabled[variable]).map((variable) => ({
            label: variable,
            data: state.datasets[variable],
            borderWidth: 1,
        }));

        chart.update('none');

        /*------------------------------------------------------------------------------------------------------------*/
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

const callbacks = {};

for(const variable of props.variables1)
{
    callbacks[variable] = (data) => {

        const array1 = decodeFloat32(data['0f0ef2c0']);
        if(array1.length === 1) {
            state.samp_rate = array1[0];
        }

        const array2 = decodeFloat32(data['1551e55f']);
        if(array2.length === 1) {
            state.frequency = array2[0];
        }

        const array3 = decodeFloat32(data['0092418b']);
        if(array3.length > 0) {
            state.datasets[variable] = array3;
            updatePlot();
        }
    };
}

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    chart = new ChartJS(canvasRef.value.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
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
                        text: props.options['x-axis-label']
                    },
                },
                y: {
                    min: props.options['y-min'],
                    max: props.options['y-max'],
                    title: {
                        display: true,
                        text: props.options['y-axis-label']
                    },
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

    console.log('Hello from Frequency Sink');

    for(const variable of props.variables1)
    {
        nss.register(variable, callbacks[variable]);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    console.log('Bye from Frequency Sink');

    for(const variable of props.variables1)
    {
        nss.unregister(variable, callbacks[variable]);
    }
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <canvas class="h-100 w-100" ref="canvasRef"></canvas>

    <!-- *********************************************************************************************************** -->

</template>
