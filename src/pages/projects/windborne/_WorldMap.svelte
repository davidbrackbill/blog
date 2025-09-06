<script>
    import { geoPath } from "d3-geo";
    import { feature } from "topojson-client";
    import { fly } from "svelte/transition";
    import { zoom, zoomIdentity } from "d3-zoom";
    import { select } from "d3-selection";
    import worldData from "./_world_atlas__2_0_2__countries_110.json";
    import WindVector from "./_WindVector.svelte";
    import proxyConfig from "../../../config/proxy.json";

    let {
        allBalloons,
        currentHour,
        scaleColor,
        onBalloonHover,
        onBalloonClick,
        onTrajectoryClick,
        selectedBalloon,
        openWeatherEnabled,
        projection,
        dimensions,
        zoomLevel = $bindable(),
        resetZoomRef = $bindable(),
    } = $props();

    const sphere = { type: "Sphere" };

    const pathGenerator = geoPath(projection);

    let windData = $state({});
    let svgElement = $state();
    let zoomTransform = $state(zoomIdentity);
    let zoomBehavior;

    let trajectory = $derived(
        !selectedBalloon?.id
            ? []
            : Object.keys(allBalloons)
                  .map((hour) => allBalloons[hour][selectedBalloon.id])
                  .filter((balloon) => balloon && balloon.x && balloon.y),
    );

    async function fetchWindData(balloon) {
        const key = `${balloon.lat.toFixed(3)},${balloon.lon.toFixed(3)}`;
        try {
            const response = await fetch(`${proxyConfig.openweatherUrl}?lat=${balloon.lat}&lon=${balloon.lon}&units=metric`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const weatherData = await response.json();
            const speed = weatherData.wind?.speed || 0; // m/s
            const dir = weatherData.wind?.deg || 0; // degrees
            const windDirection = Math.round(dir);
            const windSpeed = Math.round(speed * 2.237); // Convert m/s to mph
            
            windData[key] = {
                windSpeed,
                windDirection,
                latitude: balloon.lat,
                longitude: balloon.lon,
                source: 'OpenWeatherMap'
            };
        } catch (error) {
            console.error("Failed to fetch wind data:", error);
            windData[key] = { windSpeed: 0, windDirection: 0, error: true };
        }
    }

    // Initialize zoom behavior
    $effect(() => {
        if (svgElement) {
            zoomBehavior = zoom()
                .scaleExtent([1, 10])
                .on("zoom", (event) => {
                    zoomTransform = event.transform;
                    zoomLevel = event.transform.k;
                });

            select(svgElement).call(zoomBehavior);

            // Expose reset function to parent
            if (resetZoomRef) {
                resetZoomRef.fn = resetZoomInternal;
            }
        }
    });

    // Update wind data for selected trajectories (all trajectory points)
    $effect(() => {
        if (openWeatherEnabled && selectedBalloon?.id) {
            const trajectories = trajectory.filter((balloon) => {
                return balloon.lat && balloon.lon;
            });
            console.log('Fetching wind data for', trajectories.length, 'trajectory points');
            Promise.all(trajectories.map((balloon) => fetchWindData(balloon)));
        }
    });

    // Zoom to trajectory when balloon is selected
    $effect(() => {
        if (selectedBalloon?.id && trajectory.length > 0 && svgElement) {
            zoomToTrajectory();
        }
    });

    function zoomToTrajectory() {
        if (!trajectory.length || !svgElement) return;

        const xs = trajectory.map((b) => b.x);
        const ys = trajectory.map((b) => b.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const padding = 50;
        const width = maxX - minX + padding * 2;
        const height = maxY - minY + padding * 2;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const scale = Math.min(
            dimensions.width / width,
            dimensions.height / height,
            10, // max zoom
        );

        const translateX = dimensions.width / 2 - centerX * scale;
        const translateY = dimensions.height / 2 - centerY * scale;

        select(svgElement).call(
            zoomBehavior.transform,
            zoomIdentity.translate(translateX, translateY).scale(scale),
        );
    }

    function resetZoomInternal() {
        if (!svgElement) return;

        select(svgElement).call(zoomBehavior.transform, zoomIdentity);
    }
</script>

<!-- Map container with zoom indicator -->
<div class="relative w-full h-full">
    <!-- Zoom indicator - absolutely positioned in top right -->
    {#if zoomLevel > 1}
        <button
            onclick={resetZoomInternal}
            class="absolute top-2 right-2 z-10 bg-gray-800 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded cursor-pointer shadow-lg border-0"
            title="Click to reset zoom"
        >
            Zoom: {Math.round(zoomLevel * 100)}%
        </button>
    {/if}

    <!-- Wind explanation modal - absolutely positioned in top left -->
    {#if selectedBalloon?.id && openWeatherEnabled}
        <div class="absolute top-2 left-2 z-10 bg-white border rounded-lg shadow-lg p-3 text-xs max-w-64">
            <h3 class="font-semibold mb-2 text-gray-800">Wind Vectors</h3>
            <div class="space-y-1 text-gray-600">
                <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-blue-500"></div>
                    <span>Light: 0-10 mph</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-green-500"></div>
                    <span>Moderate: 10-20 mph</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-yellow-500"></div>
                    <span>Strong: 20-30 mph</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-4 h-0.5 bg-red-500"></div>
                    <span>Severe: 30+ mph</span>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-200 text-xs">
                    <p>Arrows show wind vectors for the current hour (not the actual winds experienced by the balloon at that position).</p>
                </div>
            </div>
        </div>
    {/if}

    <!-- SVG wrapper with responsive sizing -->
    <svg
        bind:this={svgElement}
        viewBox="0 0 {dimensions.width} {dimensions.height}"
        class="w-full h-auto border rounded bg-blue-50"
        preserveAspectRatio="xMidYMid meet"
    >
        <!-- Define arrowhead markers for wind vectors -->
        <defs>
            <marker id="wind-arrow-light" markerWidth="6" markerHeight="4" 
                    refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,4 L6,2 z" fill="#3B82F6" />
            </marker>
            <marker id="wind-arrow-moderate" markerWidth="6" markerHeight="4" 
                    refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,4 L6,2 z" fill="#10B981" />
            </marker>
            <marker id="wind-arrow-strong" markerWidth="6" markerHeight="4" 
                    refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,4 L6,2 z" fill="#F59E0B" />
            </marker>
            <marker id="wind-arrow-severe" markerWidth="6" markerHeight="4" 
                    refX="5" refY="2" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,4 L6,2 z" fill="#EF4444" />
            </marker>
        </defs>
        
        <g>
            <path fill="hsl(0, 0%, 97%)" d={pathGenerator(sphere)} />

            <g
                in:fly={{ delay: 500, duration: 1000 }}
                transform="translate({zoomTransform.x},{zoomTransform.y}) scale({zoomTransform.k})"
            >
                <!-- Layer 1: Ocean/background -->
                <path fill="hsl(0, 0%, 97%)" d={pathGenerator(sphere)} />

                <!-- Layer 2: Land masses -->
                <g fill="currentColor" stroke="currentColor" opacity="0.15">
                    <path
                        d={pathGenerator(
                            feature(worldData, worldData.objects.land),
                        )}
                    />
                </g>

                <!-- Layer 3: Current hour balloons (can be hidden when trajectory is selected) -->
                <g
                    opacity={selectedBalloon?.id ? 0 : 1}
                >
                    {#each allBalloons[currentHour] || [] as balloon}
                        {#if balloon.x !== null && balloon.y !== null}
                            <circle
                                r={2 / zoomTransform.k}
                                cx={balloon.x}
                                cy={balloon.y}
                                fill={scaleColor(balloon.hour)}
                                class="balloon-circle"
                                aria-label="Balloon {balloon.id} at hour {balloon.hour}"
                                onmouseenter={() => onBalloonHover(balloon)}
                                onmouseleave={() => onBalloonHover(null)}
                                onclick={() => onBalloonClick(balloon)}
                            />
                        {/if}
                    {/each}
                </g>

                <!-- Layer 4: Selected balloon trajectory (all hours) -->
                <g>
                    {#each trajectory as balloon}
                        <circle
                            r={2 / zoomTransform.k}
                            cx={balloon.x}
                            cy={balloon.y}
                            fill={scaleColor(balloon.hour)}
                            class="balloon-circle balloon-trajectory"
                            data-balloon-id={balloon.id}
                            aria-label="Balloon {balloon.id} at hour {balloon.hour}"
                            onclick={() => onTrajectoryClick(balloon)}
                        />
                    {/each}
                </g>

                <!-- Layer 5: Wind vectors for selected balloon trajectory -->
                {#if selectedBalloon && openWeatherEnabled}
                    <g class="wind-vectors">
                        {#each trajectory as balloon}
                            <WindVector {balloon} {windData} {scaleColor} zoomLevel={zoomTransform.k} />
                        {/each}
                    </g>
                {/if}
            </g>
        </g>
    </svg>
</div>

<style>
    .balloon-circle {
        cursor: pointer;
    }
    .balloon-circle:hover {
        cursor: pointer;
        opacity: 1 !important;
    }
    .balloon-trajectory {
        opacity: 1;
    }
    .wind-vectors {
        pointer-events: none;
    }
</style>
