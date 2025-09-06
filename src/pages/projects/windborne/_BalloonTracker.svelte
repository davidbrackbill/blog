<script>
    import { onMount } from "svelte";
    import { geoEquirectangular } from "d3-geo";
    import WorldMap from "./_WorldMap.svelte";
    import proxyConfig from "../../../config/proxy.json";
    const WINDBORNE_BASE_URL = "https://a.windbornesystems.com/treasure";

    const dimensions = { width: 1200, height: 600 };
    const sphere = { type: "Sphere" };
    const projection = geoEquirectangular().fitSize(
        [dimensions.width, dimensions.height],
        sphere,
    );

    let balloons = $state({});
    let selectedBalloon = $state({});
    let hoveredBalloon = $state(null);
    let currentHour = $state(1);
    let sliderValue = $state(1);
    let debounceTimer;
    let maxAltitudeChange = $state(0);
    let maxDistance = $state(0);
    let maxAltitudeBalloon = $state(null);
    let maxDistanceBalloon = $state(null);
    let openWeatherEnabled = $state(false);
    let zoomLevel = $state(1);
    let resetZoomRef = $state({ fn: () => {} });

    function scaleColor(hour) {
        if (!hour) return "red";
        const blueness = hour / 23;
        const red = Math.round(255 * (1 - blueness));
        const blue = Math.round(255 * blueness);
        return `rgb(${red}, 0, ${blue})`;
    }

    function onBalloonHover(balloon) {
        hoveredBalloon = balloon;
    }

    function onBalloonClick(balloon) {
        selectedBalloon = selectedBalloon?.id === balloon.id ? {} : balloon;
    }

    function onTrajectoryClick(balloon) {
        // Change to the hour of the clicked trajectory balloon
        currentHour = balloon.hour;
        sliderValue = balloon.hour;

        // Find and select the balloon at that hour with the same ID
        const balloonsAtHour = balloons[balloon.hour] || [];
        const balloonAtHour = balloonsAtHour.find((b) => b.id === balloon.id);
        if (balloonAtHour) {
            selectedBalloon = balloonAtHour;
        }
    }

    function deselectBalloon() {
        selectedBalloon = {};
    }

    function selectRandomBalloon() {
        const current = balloons[currentHour] || [];
        if (current.length > 0) {
            selectedBalloon =
                current[Math.floor(Math.random() * current.length)];
        }
    }

    function getTimeLabel(hours) {
        if (hours === 0) return "Current positions";
        if (hours === 1) return "1 hour ago";
        return `${hours} hours ago`;
    }

    function calculateMaxMetrics() {
        const DEG_TO_RAD = 0.017453292519943295; // π/180
        const EARTH_RADIUS_MM = 6.371; // Earth's radius in megameters

        let maxAlt = 0;
        let maxDist = 0;
        let altBalloon = null;
        let distBalloon = null;

        const endBalloons = balloons[0] || [];
        const startBalloons = balloons[23] || [];

        // Check each balloon ID that exists in both hours
        for (const end of endBalloons) {
            const start = startBalloons.find(b => b.id === end.id);
            if (!start) continue;

            // Altitude
            if (
                end.alt !== null &&
                end.alt !== undefined &&
                start.alt !== null &&
                start.alt !== undefined
            ) {
                const altChange = Math.abs(start.alt - end.alt);
                if (altChange > maxAlt) {
                    maxAlt = altChange;
                    altBalloon = end;
                }
            }

            // Distance
            if (
                end.lat !== null &&
                end.lon !== null &&
                start.lat !== null &&
                start.lon !== null
            ) {
                const dLat = (start.lat - end.lat) * DEG_TO_RAD;
                const dLon = (start.lon - end.lon) * DEG_TO_RAD;
                const a =
                    Math.sin(dLat * 0.5) ** 2 +
                    Math.cos(end.lat * DEG_TO_RAD) *
                        Math.cos(start.lat * DEG_TO_RAD) *
                        Math.sin(dLon * 0.5) ** 2;
                const distance =
                    2 * EARTH_RADIUS_MM *
                    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                if (distance > maxDist) {
                    maxDist = distance;
                    distBalloon = end;
                }
            }
        }

        maxAltitudeChange = Math.round(maxAlt);
        maxDistance = Math.round(maxDist);
        maxAltitudeBalloon = altBalloon;
        maxDistanceBalloon = distBalloon;
    }

    function selectMostAlt() {
        if (maxAltitudeBalloon) {
            selectedBalloon = maxAltitudeBalloon;
        }
    }

    function selectMostDist() {
        if (maxDistanceBalloon) {
            selectedBalloon = maxDistanceBalloon;
        }
    }

    function onSliderChange(event) {
        const newValue = parseInt(event.target.value);
        clearTimeout(debounceTimer);
        currentHour = newValue;
    }

    async function loadHour(hour) {
        const response = await fetch(`${proxyConfig.windborneUrl}?hour=${hour}`);
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        const valid = data && Array.isArray(data) && data.length;
        if (valid) {
            balloons[hour] = data
                .filter(
                    (balloon) => Array.isArray(balloon) && balloon.length >= 2,
                )
                .map((balloon, idx) => {
                    const coords = projection([balloon[1], balloon[0]]); // lon, lat
                    return {
                        id: idx,
                        hour: hour,
                        lat: balloon[0],
                        lon: balloon[1],
                        alt: balloon[2] || null,
                        x: coords ? coords[0] : null,
                        y: coords ? coords[1] : null,
                    };
                });
        }
    }

    onMount(async () => {
        sliderValue = 1;
        currentHour = 1;
        await Promise.all(
            Array.from({ length: 24 }, (_, hour) => loadHour(hour)),
        );
        calculateMaxMetrics();
    });
</script>

<div class="flex flex-col items-center">
    <!-- Header and Controls -->
    <div class="flex-shrink-0 align-center px-4 py-2">
        <div class="flex flex-col sm:flex-row sm:gap-8 sm:items-start">
            <h1 class="text-xl font-bold mb-4 mt-0 text-center sm:text-left">
                Windborne Balloon Tracker
            </h1>

            <!-- Slider section -->
            <div class="flex-shrink-0">
                <label
                    class="block text-sm font-medium mb-2 text-center sm:text-left"
                >
                    {getTimeLabel(sliderValue)}
                </label>
                <input
                    type="range"
                    min="0"
                    max="23"
                    bind:value={sliderValue}
                    onchange={onSliderChange}
                    class="w-full max-w-md mx-auto sm:mx-0 block"
                    style="accent-color: {scaleColor(sliderValue)}"
                />
            </div>

            <!-- Info panel -->
            <div class="mt-4 sm:mt-0 flex-shrink-0 flex items-start gap-2">
                {#if selectedBalloon?.id || hoveredBalloon}
                    {@const displayBalloon = selectedBalloon?.id
                        ? selectedBalloon
                        : hoveredBalloon}
                    <button
                        class="bg-gray-900 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg transition-colors border-0 cursor-pointer text-center w-52"
                        onclick={selectedBalloon?.id
                            ? deselectBalloon
                            : undefined}
                        title={selectedBalloon?.id
                            ? "Click to deselect balloon"
                            : "Balloon info"}
                    >
                        <div class="font-semibold">
                            Balloon {displayBalloon?.id ?? ""}
                        </div>
                        <div class="text-xs text-gray-300 whitespace-nowrap">
                            {displayBalloon?.lat?.toFixed(3)}°, {displayBalloon?.lon?.toFixed(
                                3,
                            )}°,
                            <span class="text-gray-400"
                                >{Math.round(displayBalloon?.alt ?? 0)}km</span
                            >
                        </div>
                    </button>
                {:else}
                    <button
                        class="bg-gray-900 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg transition-colors border-0 cursor-pointer text-center w-52"
                        onclick={selectRandomBalloon}
                        title="Click to select a random balloon"
                    >
                        <div class="font-semibold">Select Balloon</div>
                        <div class="text-xs text-gray-400">
                            Click for random
                        </div>
                    </button>
                {/if}

                <!-- Selection buttons -->
                <div class="flex gap-2">
                    <button
                        onclick={selectMostAlt}
                        class="bg-gray-900 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg transition-colors border-0 cursor-pointer text-center"
                        title="Select balloon with most altitude change"
                    >
                        <div class="font-semibold">Max Altitude Δ</div>
                        <div class="text-xs text-gray-400">
                            {maxAltitudeChange}km
                        </div>
                    </button>
                    <button
                        onclick={selectMostDist}
                        class="bg-gray-900 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg transition-colors border-0 cursor-pointer text-center"
                        title="Select balloon that moved farthest"
                    >
                        <div class="font-semibold">Max Distance Δ</div>
                        <div class="text-xs text-gray-400">{maxDistance}Mm</div>
                    </button>
                    <button
                        onclick={() =>
                            (openWeatherEnabled = !openWeatherEnabled)}
                        class="bg-red-900 text-white text-sm px-3 py-2 rounded-lg transition-colors border-0 cursor-pointer text-balance w-52
                        {openWeatherEnabled
                            ? 'opacity-90'
                            : 'opacity-40 hover:opacity-90'}
                        "
                    >
                        {openWeatherEnabled
                            ? "Disable current wind vectors from the OpenWeather API"
                            : "Enable current wind vectors from the OpenWeather API"}.
                    </button>
                </div>
            </div>
        </div>
    </div>

    <WorldMap
        allBalloons={balloons}
        {currentHour}
        {scaleColor}
        {onBalloonHover}
        {onBalloonClick}
        {onTrajectoryClick}
        {selectedBalloon}
        {openWeatherEnabled}
        {projection}
        {dimensions}
        bind:zoomLevel
        bind:resetZoomRef
    />
</div>
<footer class="text-center my-2 text-sm text-gray-600">
    © 2025 David Brackbill
</footer>
