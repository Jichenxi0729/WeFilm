import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useMovieStore } from './movieStore'
import { searchPeople, getPersonDetails } from '../services/tmdb'

export const useActorStore = defineStore('actor', () => {
  const actorTmdbInfo = ref({})

  const getActors = computed(() => {
    const movieStore = useMovieStore()
    const actorMap = new Map()
    
    movieStore.movies.forEach(movie => {
      if (movie.actors && Array.isArray(movie.actors)) {
        movie.actors.forEach(actor => {
          if (!actorMap.has(actor)) {
            actorMap.set(actor, {
              name: actor,
              movies: [],
              tmdbId: movie.actorTmdbIds?.[actor] || null
            })
          }
          actorMap.get(actor).movies.push({
            id: movie.id,
            title: movie.title,
            cover: movie.cover,
            releaseYear: movie.releaseYear,
            mediaType: movie.mediaType,
            overview: movie.overview
          })
        })
      }
    })

    actorMap.forEach(actor => {
      actor.movies.sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0))
    })

    return Array.from(actorMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  })

  const getActorByName = (name) => {
    return getActors.value.find(a => a.name === name)
  }

  const getActorMovieCount = (actorName) => {
    const actor = getActorByName(actorName)
    return actor ? actor.movies.length : 0
  }

  const fetchActorTmdbInfo = async (actorName) => {
    if (actorTmdbInfo.value[actorName]) {
      return actorTmdbInfo.value[actorName]
    }

    try {
      const results = await searchPeople(actorName)
      if (results && results.length > 0) {
        const person = results.find(p => p.name.toLowerCase() === actorName.toLowerCase()) || results[0]
        const details = await getPersonDetails(person.id)
        const info = {
          name: details.name,
          avatar: details.profile_path ? `https://image.tmdb.org/t/p/w185${details.profile_path}` : null,
          biography: details.biography || '暂无简介',
          birthday: details.birthday || null,
          knownFor: details.known_for_department || null,
          tmdbId: details.id
        }
        actorTmdbInfo.value[actorName] = info
        return info
      }
    } catch (error) {
      console.error('Failed to fetch actor TMDB info:', error)
    }
    return null
  }

  const getActorTmdbInfo = (actorName) => {
    return actorTmdbInfo.value[actorName] || null
  }

  return {
    getActors,
    getActorByName,
    getActorMovieCount,
    fetchActorTmdbInfo,
    getActorTmdbInfo
  }
})
