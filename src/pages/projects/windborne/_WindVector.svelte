<script>
    const { balloon, windData, zoomLevel = 1 } = $props();

    let wind = $derived(
        windData[`${balloon.lat.toFixed(3)},${balloon.lon.toFixed(3)}`],
    );

    // Wind speed categorization and color
    let windCategory = $derived.by(() => {
        if (!wind || wind.windSpeed <= 0) return null;
        if (wind.windSpeed <= 10)
            return {
                color: "#3B82F6",
                marker: "wind-arrow-light",
                category: "light",
            };
        if (wind.windSpeed <= 20)
            return {
                color: "#10B981",
                marker: "wind-arrow-moderate",
                category: "moderate",
            };
        if (wind.windSpeed <= 30)
            return {
                color: "#F59E0B",
                marker: "wind-arrow-strong",
                category: "strong",
            };
        return {
            color: "#EF4444",
            marker: "wind-arrow-severe",
            category: "severe",
        };
    });

    let rad = $derived(wind ? ((wind.windDirection - 90) * Math.PI) / 180 : 0);
    let strokeWidth = $derived.by(() => {
        if (!wind || wind.windSpeed <= 0) return 1;
        const baseWidth = Math.max(1, Math.min(wind.windSpeed / 8, 4));
        return baseWidth / Math.sqrt(zoomLevel);
    });

    let x2 = $derived(balloon.x + Math.cos(rad));
    let y2 = $derived(balloon.y + Math.sin(rad));
</script>

{#if wind && wind.windSpeed > 0 && windCategory}
    <line
        x1={balloon.x}
        y1={balloon.y}
        {x2}
        {y2}
        stroke={windCategory.color}
        stroke-width={strokeWidth}
        opacity="0.8"
        marker-end="url(#{windCategory.marker})"
    />
{/if}
