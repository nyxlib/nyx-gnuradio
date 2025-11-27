<script setup>
/*--------------------------------------------------------------------------------------------------------------------*/

import {ref, inject, reactive, onMounted, onUnmounted, nextTick} from 'vue';

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

const WATERFALL_HEIGHT = 200;

let buffer = [];

/*--------------------------------------------------------------------------------------------------------------------*/

const colorMapJet = Array.from({length: 256}, (_, i) => {

    const t = i / 255.0;

    return [
        Math.round(255.0 * Math.max(Math.min(1.5 - Math.abs(4.0 * t - 3.0), 1.0), 0.0)),
        Math.round(255.0 * Math.max(Math.min(1.5 - Math.abs(4.0 * t - 2.0), 1.0), 0.0)),
        Math.round(255.0 * Math.max(Math.min(1.5 - Math.abs(4.0 * t - 1.0), 1.0), 0.0)),
    ];
});

/*--------------------------------------------------------------------------------------------------------------------*/

const scaleDB = (value, min, max) => {

    if(value <= min) return 0.000;
    if(value >= max) return 255.0;

    return Math.round((value - min) / (max - min) * 255.0);
};

/*--------------------------------------------------------------------------------------------------------------------*/

let chart = null;

const renderWaterfall = () => {

    if(!props.enabled[props.variables1[0]])
    {
        return;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    const area = chart.chartArea;

    const dpr = window.devicePixelRatio || 1.0;

    const top = Math.round(area.top * dpr) + Math.round(dpr);
    const left = Math.round(area.left * dpr) + Math.round(dpr);
    const width = Math.round(area.width * dpr) - Math.round(dpr);
    const height = Math.round(area.height * dpr) - Math.round(dpr);

    /*----------------------------------------------------------------------------------------------------------------*/

    const ctx = canvasRef.value.getContext('2d');

    const image = ctx.createImageData(width, height);

    const data = image.data;

    /*----------------------------------------------------------------------------------------------------------------*/

    const min = props.options['y-min'];
    const max = props.options['y-max'];

    /*----------------------------------------------------------------------------------------------------------------*/

    for(let y = 0; y < height; y++)
    {
        const row = buffer[Math.floor(y * buffer.length / height)];

        for(let x = 0; x < width; x++)
        {
            const index = Math.floor(x * row.length / width);

            const value = scaleDB(row[index], min, max);

            const [r, g, b] = colorMapJet[value];

            const i = 4 * (y * width + x);

            data[i + 0] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = 255;
        }
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    ctx.putImageData(image, left, top);

    /*----------------------------------------------------------------------------------------------------------------*/
};

/*--------------------------------------------------------------------------------------------------------------------*/

const callback = (data) => {

    const array1 = decodeFloat32(data.samp_rate);
    if(array1.length === 1) {
        state.samp_rate = array1[0];
    }

    const array2 = decodeFloat32(data.frequency);
    if(array2.length === 1) {
        state.frequency = array2[0];
    }

    const array3 = decodeFloat32(data.samples);
    if(array3.length > 0) {

        buffer.push(array3.slice());
        if(buffer.length > WATERFALL_HEIGHT) {
            buffer.shift();
        }

        renderWaterfall();
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/

onMounted(() => {

    chart = new ChartJS(canvasRef.value.getContext('2d'), {
        type: 'scatter',
        data: {datasets: []},
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
                    }
                },
                y: {
                    min: 0x00000000000000,
                    max: WATERFALL_HEIGHT,
                    title: {
                        display: true,
                        text: props.options['y-axis-label']
                    },
                    ticks: {
                        reverse: true
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            interaction: {
                mode: null
            }
        }
    });

    console.log('Hello from Waterfall Sink');

    nss.register(props.variables1[0], callback);
});

/*--------------------------------------------------------------------------------------------------------------------*/

onUnmounted(() => {

    console.log('Bye from Waterfall Sink');

    nss.unregister(props.variables1[0], callback);
});

/*--------------------------------------------------------------------------------------------------------------------*/
</script>

<template>

    <!-- *********************************************************************************************************** -->

    <canvas class="h-100 w-100" ref="canvasRef"></canvas>

    <!-- *********************************************************************************************************** -->

</template>
