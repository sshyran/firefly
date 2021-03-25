<script lang="typescript">
    import { LineChart, BarChart } from 'shared/components'

    enum ChartType {
        Line = 'line',
        Bar = 'bar',
    }

    export let type: "line" | "bar"
    export let datasets
    export let labels
    export let color
    export let xMaxTicks
    export let yMaxTicks
    export let beginAtZero
    export let inlineStyle
    export let formatYAxis
</script>

{#if type === ChartType.Line}
    <LineChart {formatYAxis} {datasets} {labels} {xMaxTicks} {yMaxTicks} {beginAtZero} {color} {inlineStyle} />
{:else if type === ChartType.Bar}
    <BarChart {formatYAxis} {datasets} {labels} {inlineStyle} />
{/if}
