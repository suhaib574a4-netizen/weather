import { useEffect, useRef, useState } from 'react'
import { Clock3, Crosshair, LoaderCircle, MapPin, Search, Star, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { searchLocations } from '../../services/weatherApi'
import { getLocationSubtitle } from '../../utils/weather'

const LIST_ID = 'skycast-search-options'

export default function SearchBar() {
  const { selectLocation, favorites, recent, isFavorite, toggleFavorite, geo } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const debouncedQuery = useDebouncedValue(query.trim(), 280)

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setStatus('idle')
      return undefined
    }

    const controller = new AbortController()
    setStatus('loading')

    searchLocations(debouncedQuery, controller.signal)
      .then((locations) => {
        setResults(locations)
        setActiveIndex(0)
        setStatus(locations.length ? 'results' : 'empty')
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setResults([])
        setStatus('error')
      })

    return () => controller.abort()
  }, [debouncedQuery])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const trimmed = query.trim()
  const showResults = open && trimmed.length >= 2 && status === 'results'
  const showFeedback =
    open && trimmed.length >= 2 && (status === 'loading' || status === 'empty' || status === 'error')
  const showQuick = open && trimmed.length < 2 && (favorites.length > 0 || recent.length > 0)

  function choose(location) {
    selectLocation(location)
    setQuery('')
    setResults([])
    setStatus('idle')
    setOpen(false)
    inputRef.current?.blur()
  }

  async function useMyLocation() {
    const located = await geo.locate()
    if (located) choose(located)
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!results.length) return
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => (index + step + results.length) % results.length)
      return
    }

    if (event.key === 'Enter' && showResults) {
      event.preventDefault()
      choose(results[activeIndex] ?? results[0])
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          if (showResults) choose(results[activeIndex] ?? results[0])
        }}
      >
        <div className="glass-input flex h-12 items-center gap-2 rounded-2xl px-3.5">
          <Search size={18} className="shrink-0 text-[var(--faint)]" aria-hidden="true" />
          <label htmlFor="skycast-city-search" className="sr-only">Search for a city</label>
          <input
            ref={inputRef}
            id="skycast-city-search"
            type="text"
            value={query}
            onChange={(event) => {
              const next = event.target.value
              setQuery(next)
              setOpen(true)
              if (next.trim().length >= 2) setStatus('loading')
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search any city worldwide…"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={showResults ? LIST_ID : undefined}
            aria-autocomplete="list"
            aria-activedescendant={showResults ? `skycast-option-${activeIndex}` : undefined}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--text)] placeholder:text-[var(--faint)] focus:outline-none"
          />
          {status === 'loading' && trimmed.length >= 2 && (
            <LoaderCircle size={16} className="shrink-0 animate-spin text-[var(--accent)]" aria-hidden="true" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
                setStatus('idle')
                inputRef.current?.focus()
              }}
              className="rounded-lg p-1 text-[var(--faint)] transition hover:text-[var(--text)]"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-lg p-1.5 text-[var(--faint)] transition hover:text-[var(--accent)]"
            title="Use my current location"
            aria-label="Use my current location"
          >
            {geo.status === 'loading' ? <LoaderCircle size={17} className="animate-spin" /> : <Crosshair size={17} />}
          </button>
          <button
            type="submit"
            className="ml-0.5 hidden h-8 items-center rounded-xl bg-gradient-to-r from-[#7ddcff] to-[#5aa9ff] px-3.5 text-xs font-bold text-[#04121f] transition hover:brightness-110 sm:inline-flex"
          >
            Search
          </button>
        </div>
      </form>

      {geo.status === 'error' && open && (
        <p className="mt-2 rounded-xl border border-[rgba(251,113,133,0.25)] bg-[rgba(251,113,133,0.08)] px-3 py-2 text-xs text-[var(--danger)]" role="alert">
          {geo.error}
        </p>
      )}

      {(showResults || showFeedback || showQuick || (open && trimmed.length === 1)) && (
        <div className="panel absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[min(60vh,420px)] overflow-y-auto p-2 scroll-area">
          {trimmed.length === 1 && (
            <p className="muted px-3 py-4 text-center text-xs">Type at least 2 characters to search.</p>
          )}

          {showFeedback && status === 'loading' && (
            <p className="muted px-3 py-4 text-center text-xs">Searching locations…</p>
          )}
          {showFeedback && status === 'empty' && (
            <p className="muted px-3 py-4 text-center text-xs">No cities found. Try a different spelling or nearby city.</p>
          )}
          {showFeedback && status === 'error' && (
            <p className="px-3 py-4 text-center text-xs text-[var(--danger)]" role="alert">
              Location search is unavailable right now. Please try again.
            </p>
          )}

          {showResults && (
            <>
              <p className="section-kicker px-3 py-2 text-[10px]">Matching locations</p>
              <ul id={LIST_ID} role="listbox" aria-label="Matching locations">
                {results.map((location, index) => {
                  const favorite = isFavorite(location)
                  return (
                    <li
                      key={`${location.id}-${location.latitude}`}
                      id={`skycast-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(location)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                        index === activeIndex ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--surface-2)]'
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)]">
                        <MapPin size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{location.name}</span>
                        <span className="faint block truncate text-[11px]">{getLocationSubtitle(location) || 'Location'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleFavorite(location)
                        }}
                        onMouseDown={(event) => event.preventDefault()}
                        className="rounded-lg p-1.5 transition hover:bg-[var(--surface-hover)]"
                        aria-label={favorite ? `Remove ${location.name} from favourites` : `Save ${location.name} to favourites`}
                      >
                        <Star size={16} className={favorite ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--faint)]'} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {showQuick && (
            <>
              {favorites.length > 0 && (
                <>
                  <p className="section-kicker px-3 py-2 text-[10px]">Favourites</p>
                  {favorites.slice(0, 4).map((location) => (
                    <button
                      key={`fav-${location.id}-${location.latitude}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(location)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--surface-2)]"
                    >
                      <Star size={15} className="shrink-0 fill-[var(--warning)] text-[var(--warning)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{location.name}</span>
                        <span className="faint block truncate text-[11px]">{getLocationSubtitle(location) || 'Saved city'}</span>
                      </span>
                    </button>
                  ))}
                </>
              )}
              {recent.length > 0 && (
                <>
                  <p className="section-kicker mt-1 px-3 py-2 text-[10px]">Recently viewed</p>
                  {recent.slice(0, 4).map((location) => (
                    <button
                      key={`recent-${location.id}-${location.latitude}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(location)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[var(--surface-2)]"
                    >
                      <Clock3 size={15} className="shrink-0 text-[var(--faint)]" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{location.name}</span>
                        <span className="faint block truncate text-[11px]">{getLocationSubtitle(location) || 'Location'}</span>
                      </span>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
