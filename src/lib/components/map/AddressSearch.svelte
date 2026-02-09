<script lang="ts">
  import { geocodeSearch, type GeocodingResult } from '$lib/services/geocoding';

  interface Props {
    onSelect?: (result: { placeName: string; center: [number, number] }) => void;
  }

  let { onSelect }: Props = $props();

  let query = $state('');
  let results = $state<GeocodingResult[]>([]);
  let isLoading = $state(false);
  let hasSearched = $state(false);
  let hasError = $state(false);
  let showDropdown = $state(false);
  let containerEl: HTMLDivElement | undefined = $state();
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    query = value;
    hasSearched = false;
    hasError = false;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.length < 3) {
      results = [];
      showDropdown = false;
      return;
    }

    isLoading = true;
    showDropdown = true;

    debounceTimer = setTimeout(async () => {
      try {
        const searchResults = await geocodeSearch(value);
        // Only update if query hasn't changed during the request
        if (query === value) {
          results = searchResults;
          hasSearched = true;
          hasError = false;
          isLoading = false;
        }
      } catch {
        if (query === value) {
          results = [];
          hasSearched = true;
          hasError = true;
          isLoading = false;
        }
      }
    }, 300);
  }

  function selectResult(result: GeocodingResult) {
    query = result.place_name;
    showDropdown = false;
    results = [];
    hasSearched = false;
    onSelect?.({ placeName: result.place_name, center: result.center });
  }

  function handleClickOutside(event: MouseEvent) {
    if (containerEl && !containerEl.contains(event.target as Node)) {
      showDropdown = false;
    }
  }

  function handleFocus() {
    if (results.length > 0 || (hasSearched && query.length >= 3)) {
      showDropdown = true;
    }
  }

  $effect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  });
</script>

<div bind:this={containerEl} class="relative w-full">
  <input
    type="text"
    value={query}
    oninput={handleInput}
    onfocus={handleFocus}
    placeholder="Search for an address..."
    class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm
           focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
  />

  {#if showDropdown}
    <div
      class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
    >
      {#if isLoading}
        <div class="px-4 py-3 text-sm text-gray-500">Searching...</div>
      {:else if hasError}
        <div class="px-4 py-3 text-sm text-amber-700">
          Address search is temporarily unavailable. You can drop a pin on the map instead.
        </div>
      {:else if hasSearched && results.length === 0}
        <div class="px-4 py-3 text-sm text-gray-500">
          No results found. Try a different search or drop a pin on the map.
        </div>
      {:else}
        <ul class="max-h-60 overflow-y-auto py-1">
          {#each results as result}
            <li>
              <button
                type="button"
                onclick={() => selectResult(result)}
                class="w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700
                       hover:bg-blue-50 hover:text-blue-800"
              >
                {result.place_name}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>
